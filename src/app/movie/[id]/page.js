"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CastDetails from "@/app/components/CastDetails";
import SimilarMovies from "@/app/components/SimilarMovies";

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
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-[#FFC857]">
                    Overview
                  </h3>
                  <p className="text-[#D1D5DB] text-lg leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <div className="bg-[#0F1419] py-12">
        <CastDetails movie_id={id} />
      </div>
      <SimilarMovies movieId={id} />
    </div>
  );
};

export default DetailPage;
