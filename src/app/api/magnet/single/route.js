// src/app/api/magnet/single/route.js
import { spawn } from "child_process";
import path from "path";

export async function POST(request) {
  try {
    const { movieTitle, year } = await request.json();

    if (!movieTitle) {
      return Response.json(
        { error: "Movie title is required" },
        { status: 400 }
      );
    }

    const searchQuery = year ? `${movieTitle} ${year}` : movieTitle;
    // Updated path to match your src folder structure
    const pythonScriptPath = path.join(
      process.cwd(),
      "src",
      "scripts",
      "getMovies.py"
    );
    console.log("Script path:", pythonScriptPath);

    return new Promise((resolve) => {
      const python = spawn("python", [pythonScriptPath, searchQuery]);
      let output = "";
      let error = "";
      let isResolved = false;

      // 30-second timeout
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
