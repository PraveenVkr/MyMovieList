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

    const pythonScriptPath = path.join(
      process.cwd(),
      "src",
      "scripts",
      "letterboxd.py"
    );

    // Create a streaming response
    const stream = new ReadableStream({
      start(controller) {
        const python = spawn("python", [pythonScriptPath, letterboxdUrl]);
        let isResolved = false;
        const magnetLinks = [];

        // 3-minute timeout for entire process
        const timeout = setTimeout(() => {
          if (!isResolved) {
            python.kill("SIGTERM");
            isResolved = true;
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                message: "Request timed out after 3 minutes.",
              })}\n\n`
            );
            controller.close();
          }
        }, 180000);

        python.stdout.on("data", (data) => {
          const output = data.toString();
          console.log("Python output:", output);

          // Parse for magnet links in real-time
          const lines = output.split("\n");
          lines.forEach((line) => {
            const magnetMatch = line.match(/(.+?) → (magnet:\?[^\s]+)/);
            if (magnetMatch) {
              const movieData = {
                title: magnetMatch[1].trim(),
                magnetLink: magnetMatch[2],
                id: Date.now() + Math.random(), // Temporary ID
              };

              magnetLinks.push(movieData);

              // Send real-time update
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "movie_found",
                  movie: movieData,
                })}\n\n`
              );
            }

            // Send progress updates
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
                  })}\n\n`
                );
              }
            }

            // Send timeout notifications
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

            // Send error notifications
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

          if (code !== 0) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                message: "Failed to process Letterboxd list.",
              })}\n\n`
            );
          } else {
            // Send completion message
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "complete",
                totalFound: magnetLinks.length,
              })}\n\n`
            );
          }

          controller.close();
        });

        python.on("error", (err) => {
          if (isResolved) return;

          clearTimeout(timeout);
          isResolved = true;
          console.log("Process spawn error:", err);

          controller.enqueue(
            `data: ${JSON.stringify({
              type: "error",
              message: "Failed to execute Python script.",
            })}\n\n`
          );
          controller.close();
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
