"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CastDetails from "@/app/components/CastDetails";
import SimilarMovies from "@/app/components/SimilarMovies";
import WatchProvidersBox from "@/app/components/WatchProvidersBox";

// Magnet Link Button Component
const MagnetLinkButton = ({ movieTitle, releaseDate }) => {
  const [magnetLink, setMagnetLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetMagnet = async () => {
    setLoading(true);
    setError(null);
    setMagnetLink(null);

    try {
      const year = new Date(releaseDate).getFullYear();
      const response = await fetch("/api/magnet/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieTitle, year }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 408) {
          setError("Request timed out after 30 seconds. Please try again.");
        } else {
          setError(data.error || "Failed to get magnet link");
        }
        return;
      }

      if (data.magnetLink) {
        setMagnetLink(data.magnetLink);
      } else {
        setError("No magnet link found for this movie");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleGetMagnet}
        disabled={loading}
        className="group relative px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-500 hover:to-pink-500"
      >
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Searching... (30s timeout)
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Get Magnet Link
            </>
          )}
        </span>

        {/* Button Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
      </button>

      {/* Success State */}
      {magnetLink && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl border border-green-700/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-green-400 font-medium">✅ Magnet link found!</p>
          </div>
          <div className="flex gap-3">
            <a
              href={magnetLink}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-500 hover:to-emerald-500 transition-colors text-center"
            >
              📎 Open Magnet Link
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(magnetLink)}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-2xl border border-red-700/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-400 font-medium">❌ {error}</p>
          </div>
          <button
            onClick={handleGetMagnet}
            className="px-4 py-2 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

const DetailPage = ({ params }) => {
  const { id } = params; // Extract movie ID from the route

  const [movie, setMovie] = useState(null); // Movie details state
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;

      try {
        const res = await fetch(`/api/movies/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch movie details");
        }

        const data = await res.json();
        setMovie(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#2286FE] mx-auto mb-4"></div>
          <p className="text-[#D1D5DB] text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-2">Error loading movie</p>
          <p className="text-[#B0B5C2]">{error}</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <p className="text-[#D1D5DB] text-lg">No movie data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Background with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1419] via-[#0F1419]/90 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Poster */}
            <div className="flex-shrink-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                width={300}
                height={450}
                className="rounded-2xl shadow-2xl border-4 border-[#232A34]/50"
                priority
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#D1D5DB] bg-clip-text text-transparent">
                  {movie.title}
                </h1>

                {/* Rating and Meta Info */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#FFC857]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927C9.347 2.01 10.653 2.01 10.951 2.927l.588 1.85a1 1 0 00.95.69h1.95c.969 0 1.371 1.24.588 1.81l-1.58 1.15a1 1 0 00-.364 1.118l.588 1.85c.298.917-.755 1.67-1.538 1.118l-1.58-1.15a1 1 0 00-1.176 0l-1.58 1.15c-.783.552-1.836-.201-1.538-1.118l.588-1.85a1 1 0 00-.364-1.118L2.372 7.377c-.783-.57-.38-1.81.588-1.81h1.95a1 1 0 00.95-.69l.588-1.85z" />
                    </svg>
                    <span className="text-xl font-semibold text-[#FFC857]">
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>

                  <div className="text-[#B0B5C2]">{movie.runtime} min</div>

                  <div className="text-[#B0B5C2]">
                    {new Date(movie.release_date).getFullYear()}
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-[#232A34] text-[#D1D5DB] rounded-full text-sm font-medium"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Release Date */}
                <div className="mb-6">
                  <span className="text-[#FFC857] font-semibold">
                    Release Date:{" "}
                  </span>
                  <span className="text-[#D1D5DB]">
                    {new Date(movie.release_date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Overview */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-3 text-[#FFC857]">
                    Overview
                  </h3>
                  <p className="text-[#D1D5DB] text-lg leading-relaxed">
                    {movie.overview}
                  </p>
                </div>

                {/* Magnet Link Button - Added Here */}
                {/* <MagnetLinkButton
                  movieTitle={movie.title}
                  releaseDate={movie.release_date}
                /> */}
                <WatchProvidersBox movieId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="bg-[#0F1419] py-12">
        <CastDetails movie_id={id} />
      </div>

      {/* Similar Movies Section */}
      <SimilarMovies movieId={id} />
    </div>
  );
};

export default DetailPage;
