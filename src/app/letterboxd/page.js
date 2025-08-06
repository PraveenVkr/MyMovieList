"use client";
import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Movie Card Component
const LetterboxdMovieCard = ({ movie, loading: movieLoading }) => {
  if (movieLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-slate-700/30 animate-pulse">
        <div className="aspect-[2/3] bg-slate-700/50"></div>
        <div className="p-6 space-y-3">
          <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
          <div className="h-10 bg-slate-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-slate-700/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
        {/* Poster Container */}
        {movie.poster_path ? (
          <Link href={`/movie/${movie.id}`}>
            <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={`${movie.title} Poster`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {movie.vote_average > 0 && (
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl px-3 py-1.5 flex items-center gap-1.5 border border-slate-600/30">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927C9.347 2.01 10.653 2.01 10.951 2.927l.588 1.85a1 1 0 00.95.69h1.95c.969 0 1.371 1.24.588 1.81l-1.58 1.15a1 1 0 00-.364 1.118l.588 1.85c.298.917-.755 1.67-1.538 1.118l-1.58-1.15a1 1 0 00-1.176 0l-1.58 1.15c-.783.552-1.836-.201-1.538-1.118l.588-1.85a1 1 0 00-.364-1.118L2.372 7.377c-.783-.57-.38-1.81.588-1.81h1.95a1 1 0 00.95-.69l.588-1.85z" />
                  </svg>
                  <span className="text-white text-sm font-bold">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="aspect-[2/3] bg-slate-700 flex items-center justify-center">
            <span className="text-slate-400 text-sm">No Poster</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 mb-2">
              {movie.title}
            </h3>
            <div className="flex justify-between items-center text-sm text-slate-400 mb-4">
              <span>
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "Unknown"}
              </span>
              {movie.runtime && <span>{movie.runtime} min</span>}
            </div>

            {/* Status Badge */}
            {movie.status && (
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    movie.status === "found"
                      ? "bg-green-900/20 text-green-300 border border-green-700/30"
                      : movie.status === "no_streaming"
                      ? "bg-orange-900/20 text-orange-300 border border-orange-700/30"
                      : movie.status === "not_found"
                      ? "bg-orange-900/20 text-orange-300 border border-orange-700/30"
                      : "bg-red-900/20 text-red-300 border border-red-700/30"
                  }`}
                >
                  {movie.status === "found" && "✅ Found with Streaming"}
                  {movie.status === "no_streaming" && "📺 Found, No Streaming"}
                  {movie.status === "not_found" && "❓ Not Found on TMDb"}
                  {movie.status === "error" && "❌ Error"}
                </span>
              </div>
            )}
          </div>

          {/* Streaming Providers Section */}
          <div className="space-y-3">
            {movie.streamingProviders && movie.streamingProviders.length > 0 ? (
              <div>
                <p className="text-xs text-slate-400 mb-2">Available on:</p>
                <div className="flex flex-wrap gap-2">
                  {movie.streamingProviders.slice(0, 3).map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex items-center gap-1 bg-slate-700/50 rounded-lg px-2 py-1"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-4 h-4 rounded"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <span className="text-xs text-slate-300">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                  {movie.streamingProviders.length > 3 && (
                    <div className="flex items-center justify-center bg-slate-700/50 rounded-lg px-2 py-1">
                      <span className="text-xs text-slate-400">
                        +{movie.streamingProviders.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-3">
                <p className="text-xs text-orange-300">
                  {movie.status === "not_found"
                    ? "❓ Movie not found on TMDb"
                    : "🔍 No streaming providers found"}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {movie.streamingProviders &&
              movie.streamingProviders.length > 0 ? (
                <Link
                  href={`/movie/${movie.id}#streaming`}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-center font-medium hover:from-green-500 hover:to-emerald-500 transition-colors"
                >
                  📺 Where to Stream
                </Link>
              ) : (
                <div className="w-full px-4 py-2 bg-slate-600 text-slate-300 rounded-xl text-center font-medium cursor-not-allowed">
                  {movie.status === "not_found"
                    ? "❓ Not Available"
                    : "❌ No Streaming Options"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ current, total, currentMovie, phase }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const getPhaseInfo = () => {
    switch (phase) {
      case "extracting":
        return {
          label: "Extracting Movie Names",
          color: "from-purple-500 to-pink-500",
          icon: "📋",
        };
      case "processing":
        return {
          label: "Finding Streaming Services",
          color: "from-green-500 to-blue-500",
          icon: "🎬",
        };
      default:
        return {
          label: "Processing Movies",
          color: "from-blue-500 to-purple-500",
          icon: "⚡",
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-slate-300 flex items-center gap-2">
          <span>{phaseInfo.icon}</span>
          {phaseInfo.label}
        </span>
        <span className="text-slate-400">
          {current}/{total}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`bg-gradient-to-r ${phaseInfo.color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {currentMovie && (
        <p className="text-slate-400 text-sm mt-2">
          Currently processing:{" "}
          <span className="text-white">{currentMovie}</span>
        </p>
      )}
    </div>
  );
};

// Main Component
const LetterboxdPage = () => {
  const searchParams = useSearchParams();
  const letterboxdUrl = searchParams.get("url");

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [currentMovie, setCurrentMovie] = useState("");
  const [phase, setPhase] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(null);

  const processedTitles = useRef(new Set());
  const readerRef = useRef(null);
  const isCleanedUpRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !letterboxdUrl) {
      if (!letterboxdUrl) {
        setError("No Letterboxd URL provided");
        setLoading(false);
      }
      return;
    }

    fetchLetterboxdMovies();

    return () => {
      isCleanedUpRef.current = true;
      if (readerRef.current) {
        try {
          readerRef.current.cancel();
        } catch (error) {
          console.log("Error canceling reader:", error);
        }
      }
    };
  }, [letterboxdUrl, mounted]);

  const addNotification = (message, type = "info") => {
    if (isCleanedUpRef.current) return;

    const notification = { id: Date.now(), message, type };
    setNotifications((prev) => [...prev.slice(-4), notification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const fetchLetterboxdMovies = async () => {
    try {
      setLoading(true);
      setMovies([]);
      processedTitles.current.clear();

      const response = await fetch("/api/letterboxd/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterboxdUrl }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to process list";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = (await response.text()) || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Stream not supported");
      }

      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        if (isCleanedUpRef.current) {
          try {
            reader.cancel();
          } catch (e) {
            console.log("Reader already closed");
          }
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonString = line.slice(6).trim();
              if (!jsonString) continue;

              const data = JSON.parse(jsonString);

              if (!isCleanedUpRef.current) {
                switch (data.type) {
                  case "progress":
                    if (data.current && data.total) {
                      setProgress({ current: data.current, total: data.total });
                      setCurrentMovie(data.movieTitle || "");
                      if (data.phase) {
                        setPhase(data.phase);
                      }
                    } else if (data.message) {
                      addNotification(data.message, "info");
                    }
                    break;

                  case "movie_found":
                    const titleLower = data.movie.title.toLowerCase();
                    if (!processedTitles.current.has(titleLower)) {
                      processedTitles.current.add(titleLower);

                      setMovies((prev) => [...prev, data.movie]);

                      const statusEmoji = {
                        found: "✅",
                        no_streaming: "📺",
                        not_found: "❓",
                        error: "❌",
                      };
                      const statusText = {
                        found: "Found with Streaming",
                        no_streaming: "Found, No Streaming",
                        not_found: "Not Found",
                        error: "Error",
                      };

                      const emoji = statusEmoji[data.movie.status] || "✅";
                      const text = statusText[data.movie.status] || "Processed";
                      const notifType = ["error", "not_found"].includes(
                        data.movie.status
                      )
                        ? "error"
                        : "success";

                      addNotification(
                        `${emoji} ${text}: ${data.movie.title}`,
                        notifType
                      );
                    }
                    break;

                  case "complete":
                    setLoading(false);
                    if (data.stats) {
                      setStats(data.stats);
                      addNotification(
                        `Completed! Processed ${data.stats.processed} movies`,
                        "success"
                      );
                    } else {
                      addNotification(
                        `Completed! Found ${processedTitles.current.size} unique movies`,
                        "success"
                      );
                    }
                    break;

                  case "error":
                    setError(data.message);
                    setLoading(false);
                    break;

                  default:
                    console.log("Unknown SSE message type:", data.type);
                    break;
                }
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
              console.error("Problematic line:", line);
            }
          }
        }
      }
    } catch (error) {
      if (!isCleanedUpRef.current) {
        console.error("Fetch error:", error);
        setError(error.message);
        setLoading(false);
      }
    } finally {
      readerRef.current = null;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-800 to-red-700 rounded-full flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Error Processing List
          </h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const moviesWithStreaming = movies.filter(
    (movie) => movie.streamingProviders?.length > 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Letterboxd Streaming Discovery
            </h1>
            <p className="text-slate-400 text-lg mb-2">
              {loading
                ? "Finding streaming services..."
                : `Found ${movies.length} movies • ${moviesWithStreaming.length} with streaming options`}
            </p>
            <div className="flex justify-center">
              <Link
                href="/"
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          {loading && progress.total > 0 && (
            <ProgressBar
              current={progress.current}
              total={progress.total}
              currentMovie={currentMovie}
              phase={phase}
            />
          )}

          {/* Stats Summary */}
          {!loading && movies.length > 0 && (
            <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {movies.length}
                </div>
                <div className="text-sm text-slate-400">Total Movies</div>
              </div>
              <div className="bg-green-900/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {moviesWithStreaming.length}
                </div>
                <div className="text-sm text-slate-400">With Streaming</div>
              </div>
              <div className="bg-orange-900/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {movies.filter((m) => m.status === "no_streaming").length}
                </div>
                <div className="text-sm text-slate-400">No Streaming</div>
              </div>
              <div className="bg-red-900/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {
                    movies.filter((m) =>
                      ["not_found", "error"].includes(m.status)
                    ).length
                  }
                </div>
                <div className="text-sm text-slate-400">Not Found</div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="fixed top-20 right-4 z-50 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm border max-w-sm ${
                    notification.type === "success"
                      ? "bg-green-900/20 border-green-700 text-green-300"
                      : notification.type === "warning"
                      ? "bg-yellow-900/20 border-yellow-700 text-yellow-300"
                      : notification.type === "error"
                      ? "bg-red-900/20 border-red-700 text-red-300"
                      : "bg-blue-900/20 border-blue-700 text-blue-300"
                  }`}
                >
                  <div className="text-sm">{notification.message}</div>
                </div>
              ))}
            </div>
          )}

          {/* Movies Grid */}
          {movies.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
              {movies.map((movie, index) => (
                <LetterboxdMovieCard
                  key={movie.id || index}
                  movie={movie}
                  loading={false}
                />
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && movies.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300 text-lg">
                Finding streaming services...
              </p>
              <p className="text-slate-400 text-sm mt-2">
                This may take a moment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper Component with Suspense
function LetterboxdPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <LetterboxdPage />
    </Suspense>
  );
}

export default LetterboxdPageWrapper;
