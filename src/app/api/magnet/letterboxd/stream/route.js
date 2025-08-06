// src/app/api/letterboxd/stream/route.js
import { spawn } from "child_process";
import path from "path";

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

          // Now process each movie name
          for (let i = 0; i < movieNames.length; i++) {
            if (isResolved) break;

            const movieName = movieNames[i];

            try {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "progress",
                  current: i + 1,
                  total: movieNames.length,
                  movieTitle: movieName,
                  phase: "processing",
                })}\n\n`
              );

              // Search TMDb
              const tmdbMovie = await searchTMDbMovie(movieName);

              if (tmdbMovie) {
                // Get streaming providers
                const streamingProviders = await getStreamingProviders(
                  tmdbMovie.id
                );

                const movieResult = {
                  ...tmdbMovie,
                  originalTitle: movieName,
                  streamingProviders,
                  status:
                    streamingProviders.length > 0 ? "found" : "no_streaming",
                };

                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "movie_found",
                    movie: movieResult,
                  })}\n\n`
                );
              } else {
                // Movie not found on TMDb
                const movieResult = {
                  id: `not_found_${Date.now()}_${i}`,
                  title: movieName,
                  originalTitle: movieName,
                  poster_path: null,
                  vote_average: 0,
                  release_date: null,
                  streamingProviders: [],
                  status: "not_found",
                };

                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "movie_found",
                    movie: movieResult,
                  })}\n\n`
                );
              }

              // Small delay to avoid rate limiting
              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (error) {
              console.error(`Error processing ${movieName}:`, error);

              const movieResult = {
                id: `error_${Date.now()}_${i}`,
                title: movieName,
                originalTitle: movieName,
                poster_path: null,
                vote_average: 0,
                release_date: null,
                streamingProviders: [],
                status: "error",
              };

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

          // Send completion
          try {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "complete",
                stats: {
                  total: movieNames.length,
                  processed: movieNames.length,
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
