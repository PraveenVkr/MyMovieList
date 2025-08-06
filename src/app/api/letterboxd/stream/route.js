// src/app/api/letterboxd/stream/route.js
import { spawn } from "child_process";
import path from "path";
import redis from "@/lib/redis";
import crypto from "crypto";

// Generate cache key for streaming data
function getStreamingCacheKey(movieTitle) {
  const hash = crypto
    .createHash("md5")
    .update(movieTitle.toLowerCase())
    .digest("hex");
  return `streaming:${hash}`;
}

async function getCachedStreamingData(movieTitle) {
  try {
    const cacheKey = getStreamingCacheKey(movieTitle);
    const cached = await redis.get(cacheKey);

    if (cached) {
      const cachedData = JSON.parse(cached);
      return {
        ...cachedData,
        status: "cached",
      };
    }
    return null;
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}

async function cacheStreamingData(movieTitle, movieData) {
  try {
    const cacheKey = getStreamingCacheKey(movieTitle);
    await redis.setex(cacheKey, 86400, JSON.stringify(movieData)); // 24-hour cache
    console.log(`Cached streaming data for: ${movieTitle}`);
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

async function searchTMDbMovie(title) {
  try {
    const cleanTitle = title.replace(/\(\d{4}\)/, "").trim();
    const yearMatch = title.match(/\((\d{4})\)/);

    const searchParams = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY,
      query: cleanTitle,
      language: "en-US",
      ...(yearMatch && { year: yearMatch[1] }),
    });

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?${searchParams}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error(`Error searching TMDb for ${title}:`, error);
    return null;
  }
}

async function getStreamingProviders(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${process.env.TMDB_API_KEY}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    const providers = [];

    // Check major regions
    const regions = ["US", "GB", "IN", "CA", "AU"];

    regions.forEach((region) => {
      if (data.results?.[region]) {
        const regionData = data.results[region];

        // Add streaming providers
        if (regionData.flatrate) {
          regionData.flatrate.slice(0, 3).forEach((provider) => {
            if (
              !providers.find((p) => p.provider_id === provider.provider_id)
            ) {
              providers.push({
                ...provider,
                region,
                type: "stream",
              });
            }
          });
        }

        // Add rental providers
        if (regionData.rent) {
          regionData.rent.slice(0, 2).forEach((provider) => {
            if (
              !providers.find((p) => p.provider_id === provider.provider_id)
            ) {
              providers.push({
                ...provider,
                region,
                type: "rent",
              });
            }
          });
        }
      }
    });

    return providers.slice(0, 6);
  } catch (error) {
    console.error("Error fetching streaming providers:", error);
    return [];
  }
}

export async function POST(request) {
  try {
    const { letterboxdUrl } = await request.json();

    if (!letterboxdUrl || !letterboxdUrl.includes("letterboxd.com")) {
      return Response.json(
        { error: "Valid Letterboxd URL required" },
        { status: 400 }
      );
    }

    if (!process.env.TMDB_API_KEY) {
      return Response.json(
        { error: "TMDB_API_KEY not configured" },
        { status: 500 }
      );
    }

    const pythonScriptPath = path.join(
      process.cwd(),
      "src",
      "scripts",
      "letterboxd.py"
    );

    const stream = new ReadableStream({
      start(controller) {
        const python = spawn("python", [pythonScriptPath, letterboxdUrl]);
        let isResolved = false;
        const movieNames = [];
        let totalMovies = 0;
        let cachedCount = 0;
        let streamingCount = 0;

        const cleanup = () => {
          if (!isResolved) {
            python.kill("SIGTERM");
            isResolved = true;
          }
        };

        const timeout = setTimeout(() => {
          cleanup();
          try {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                message: "Request timed out",
              })}\n\n`
            );
            controller.close();
          } catch (e) {}
        }, 180000);

        python.stdout.on("data", (data) => {
          if (isResolved) return;

          const output = data.toString();
          const lines = output.split("\n");

          lines.forEach((line) => {
            if (line.startsWith("MOVIE_NAME: ")) {
              try {
                const movieData = JSON.parse(line.replace("MOVIE_NAME: ", ""));
                movieNames.push(movieData.title);

                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "progress",
                    current: movieNames.length,
                    total: 20,
                    movieTitle: movieData.title,
                    phase: "extracting",
                  })}\n\n`
                );
              } catch (e) {}
            }
          });
        });

        python.on("close", async (code) => {
          if (isResolved) return;
          clearTimeout(timeout);

          if (code !== 0 || movieNames.length === 0) {
            try {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "error",
                  message: "Failed to extract movies from Letterboxd",
                })}\n\n`
              );
              controller.close();
            } catch (e) {}
            return;
          }

          totalMovies = movieNames.length;

          // Check cache for all movies first
          const cacheResults = await Promise.allSettled(
            movieNames.map((movieName) => getCachedStreamingData(movieName))
          );

          // Send cached results immediately
          for (let i = 0; i < cacheResults.length; i++) {
            if (isResolved) break;

            const result = cacheResults[i];
            const movieName = movieNames[i];

            if (result.status === "fulfilled" && result.value) {
              cachedCount++;
              if (result.value.streamingProviders?.length > 0) {
                streamingCount++;
              }

              try {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "movie_found",
                    movie: {
                      ...result.value,
                      originalTitle: movieName,
                    },
                  })}\n\n`
                );
              } catch (e) {}
            }
          }

          // Process uncached movies
          const uncachedMovies = [];
          for (let i = 0; i < cacheResults.length; i++) {
            const result = cacheResults[i];
            if (result.status === "rejected" || !result.value) {
              uncachedMovies.push({ name: movieNames[i], index: i });
            }
          }

          if (uncachedMovies.length > 0) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "progress",
                message: `Found ${cachedCount} cached movies, fetching ${uncachedMovies.length} fresh...`,
              })}\n\n`
            );

            // Process uncached movies one by one
            for (let i = 0; i < uncachedMovies.length; i++) {
              if (isResolved) break;

              const { name: movieName, index: originalIndex } =
                uncachedMovies[i];

              try {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "progress",
                    current: cachedCount + i + 1,
                    total: totalMovies,
                    movieTitle: movieName,
                    phase: "processing",
                  })}\n\n`
                );

                // Search TMDb
                const tmdbMovie = await searchTMDbMovie(movieName);

                let movieResult;

                if (tmdbMovie) {
                  // Get streaming providers
                  const streamingProviders = await getStreamingProviders(
                    tmdbMovie.id
                  );

                  movieResult = {
                    ...tmdbMovie,
                    originalTitle: movieName,
                    streamingProviders,
                    status:
                      streamingProviders.length > 0 ? "found" : "no_streaming",
                  };

                  if (streamingProviders.length > 0) {
                    streamingCount++;
                  }
                } else {
                  // Movie not found on TMDb
                  movieResult = {
                    id: `not_found_${Date.now()}_${originalIndex}`,
                    title: movieName,
                    originalTitle: movieName,
                    poster_path: null,
                    vote_average: 0,
                    release_date: null,
                    streamingProviders: [],
                    status: "not_found",
                  };
                }

                // Cache the result
                await cacheStreamingData(movieName, movieResult);

                // Send result
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "movie_found",
                    movie: movieResult,
                  })}\n\n`
                );

                // Small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 200));
              } catch (error) {
                console.error(`Error processing ${movieName}:`, error);

                const movieResult = {
                  id: `error_${Date.now()}_${originalIndex}`,
                  title: movieName,
                  originalTitle: movieName,
                  poster_path: null,
                  vote_average: 0,
                  release_date: null,
                  streamingProviders: [],
                  status: "error",
                };

                // Cache the error result too (with shorter TTL)
                try {
                  const cacheKey = getStreamingCacheKey(movieName);
                  await redis.setex(
                    cacheKey,
                    3600,
                    JSON.stringify(movieResult)
                  ); // 1-hour cache for errors
                } catch (e) {}

                try {
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      type: "movie_found",
                      movie: movieResult,
                    })}\n\n`
                  );
                } catch (e) {}
              }
            }
          }

          // Send completion with stats
          try {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "complete",
                stats: {
                  total: totalMovies,
                  processed: totalMovies,
                  cached: cachedCount,
                  found: streamingCount,
                },
              })}\n\n`
            );
            controller.close();
          } catch (e) {}

          isResolved = true;
        });

        python.on("error", (err) => {
          if (isResolved) return;
          clearTimeout(timeout);
          isResolved = true;

          try {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                message: "Failed to run Python script",
              })}\n\n`
            );
            controller.close();
          } catch (e) {}
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.log("API route error:", error);
    return Response.json(
      {
        error: "Server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
