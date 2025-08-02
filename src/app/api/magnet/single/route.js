import { spawn } from "child_process";
import path from "path";
import redis from "@/lib/redis";
import crypto from "crypto";

function getCacheKey(movieTitle, year) {
  const searchTerm = `${movieTitle} ${year || ""}`.trim().toLowerCase();
  const hash = crypto.createHash("md5").update(searchTerm).digest("hex");
  return `magnet:${hash}`;
}

export async function POST(request) {
  try {
    const { movieTitle, year } = await request.json();

    if (!movieTitle) {
      return Response.json(
        { error: "Movie title is required" },
        { status: 400 }
      );
    }

    // Check Redis cache first
    const cacheKey = getCacheKey(movieTitle, year);
    const cached = await redis.get(cacheKey);

    if (cached) {
      const cachedData = JSON.parse(cached);
      console.log("Cache hit for:", movieTitle);

      return Response.json({
        movieTitle,
        magnetLink: cachedData.magnet_link,
        success: !!cachedData.magnet_link,
        message: cachedData.magnet_link
          ? "Magnet link found (cached)"
          : "No magnet link found (cached)",
        cached: true,
      });
    }

    // If not in cache, run Python script
    const searchQuery = year ? `${movieTitle} ${year}` : movieTitle;
    const pythonScriptPath = path.join(
      process.cwd(),
      "src",
      "scripts",
      "getMovies.py"
    );

    return new Promise((resolve) => {
      const python = spawn("python", [pythonScriptPath, searchQuery]);
      let output = "";
      let error = "";
      let isResolved = false;

      const timeout = setTimeout(() => {
        if (!isResolved) {
          python.kill("SIGTERM");
          isResolved = true;
          resolve(
            Response.json(
              {
                error: "Request timed out after 30 seconds",
              },
              { status: 408 }
            )
          );
        }
      }, 30000);

      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      python.stderr.on("data", (data) => {
        error += data.toString();
      });

      python.on("close", (code) => {
        if (isResolved) return;

        clearTimeout(timeout);
        isResolved = true;

        if (code !== 0) {
          resolve(
            Response.json(
              {
                error: "Failed to fetch magnet link",
                details: error,
              },
              { status: 500 }
            )
          );
          return;
        }

        const magnetMatch = output.match(/magnet:\?[^\s]+/);
        const magnetLink = magnetMatch ? magnetMatch[0] : null;

        resolve(
          Response.json({
            movieTitle,
            magnetLink,
            success: !!magnetLink,
            message: magnetLink ? "Magnet link found" : "No magnet link found",
            cached: false,
          })
        );
      });

      python.on("error", (err) => {
        if (isResolved) return;

        clearTimeout(timeout);
        isResolved = true;
        resolve(
          Response.json(
            {
              error: "Failed to execute Python script",
              details: err.message,
            },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    return Response.json(
      {
        error: "Server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
