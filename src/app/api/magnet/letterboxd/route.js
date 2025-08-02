// src/app/api/magnet/letterboxd/route.js
import { spawn } from "child_process";
import path from "path";

export async function POST(request) {
  try {
    const { letterboxdUrl } = await request.json();

    if (!letterboxdUrl) {
      return Response.json(
        { error: "Letterboxd URL is required" },
        { status: 400 }
      );
    }

    if (!letterboxdUrl.includes("letterboxd.com")) {
      return Response.json(
        {
          error: "Please provide a valid Letterboxd URL",
        },
        { status: 400 }
      );
    }

    console.log("Processing Letterboxd URL:", letterboxdUrl);

    // Always run fresh - no list-level caching, only individual magnet caching
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

        const cleanup = () => {
          if (!isResolved) {
            python.kill("SIGTERM");
            isResolved = true;
          }
        };

        const timeout = setTimeout(() => {
          cleanup();
          if (!isResolved) {
            try {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "error",
                  message: "Request timed out after 3 minutes.",
                })}\n\n`
              );
              controller.close();
            } catch (e) {
              console.log("Controller already closed on timeout");
            }
          }
        }, 180000);

        python.stdout.on("data", (data) => {
          if (isResolved) return;

          const output = data.toString();
          console.log("Python output:", output);

          const lines = output.split("\n");
          lines.forEach((line) => {
            if (isResolved) return;

            try {
              // Parse MOVIE_RESULT from new Python script
              if (line.startsWith("MOVIE_RESULT: ")) {
                const movieData = JSON.parse(
                  line.replace("MOVIE_RESULT: ", "")
                );

                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "movie_found",
                    movie: movieData,
                  })}\n\n`
                );
              }

              // Send progress updates for cache checking
              if (line.includes("Checking cache")) {
                const cacheMatch = line.match(
                  /Checking cache (\d+)\/(\d+): (.+)/
                );
                if (cacheMatch) {
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      type: "progress",
                      current: parseInt(cacheMatch[1]),
                      total: parseInt(cacheMatch[2]),
                      movieTitle: cacheMatch[3],
                      phase: "cache_check",
                    })}\n\n`
                  );
                }
              }

              // Send progress updates for online fetching
              if (line.includes("Processing movie")) {
                const progressMatch = line.match(
                  /Processing movie (\d+)\/(\d+): (.+)/
                );
                if (progressMatch) {
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      type: "progress",
                      current: parseInt(progressMatch[1]),
                      total: parseInt(progressMatch[2]),
                      movieTitle: progressMatch[3],
                      phase: "fetching",
                    })}\n\n`
                  );
                }
              }

              // Send timeout/error notifications
              if (line.includes("⏰ Timeout for")) {
                const timeoutMatch = line.match(/⏰ Timeout for (.+?) \(/);
                if (timeoutMatch) {
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      type: "movie_timeout",
                      movieTitle: timeoutMatch[1],
                    })}\n\n`
                  );
                }
              }

              if (line.includes("🔥 Error for")) {
                const errorMatch = line.match(/🔥 Error for (.+?):/);
                if (errorMatch) {
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      type: "movie_error",
                      movieTitle: errorMatch[1],
                    })}\n\n`
                  );
                }
              }
            } catch (e) {
              console.log("Error enqueuing data:", e.message);
            }
          });
        });

        python.stderr.on("data", (data) => {
          console.log("Python error:", data.toString());
        });

        python.on("close", (code) => {
          if (isResolved) return;

          clearTimeout(timeout);
          isResolved = true;

          console.log("Process closed with code:", code);

          try {
            if (code !== 0) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "error",
                  message: "Failed to process Letterboxd list.",
                })}\n\n`
              );
            } else {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "complete",
                })}\n\n`
              );
            }

            controller.close();
          } catch (e) {
            console.log("Controller already closed on process close");
          }
        });

        python.on("error", (err) => {
          if (isResolved) return;

          clearTimeout(timeout);
          isResolved = true;
          console.log("Process spawn error:", err);

          try {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                message: "Failed to execute Python script.",
              })}\n\n`
            );
            controller.close();
          } catch (e) {
            console.log("Controller already closed on error");
          }
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
