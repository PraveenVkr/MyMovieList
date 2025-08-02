"use client";
import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";

const TopRatedMoviesPage = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [movies, setMovies] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTopRated = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies/toprated?page=${page}`);

      if (!res.ok) {
        throw new Error("Failed to fetch top rated movies");
      }

      const data = await res.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error:", err);
      setMovies([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopRated();
  }, [page]);

  const SkeletonLoader = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#232A34]/50 rounded-2xl overflow-hidden shadow-lg animate-pulse"
        >
          <div className="h-64 bg-[#232A34]/80"></div>
          <div className="p-4 space-y-2">
            <div className="h-4 bg-[#232A34]/80 w-3/4 rounded"></div>
            <div className="h-3 bg-[#232A34]/60 w-1/2 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const Pagination = () => (
    <div className="flex justify-center items-center gap-4 my-8">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="px-6 py-2 bg-[#232A34] text-white rounded-lg hover:bg-[#2286FE] disabled:opacity-50 transition"
      >
        Previous
      </button>
      <span className="text-[#D1D5DB]">
        Page <span className="text-[#FFC857]">{page}</span> of{" "}
        <span className="text-[#FFC857]">{totalPages}</span>
      </span>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
        className="px-6 py-2 bg-[#232A34] text-white rounded-lg hover:bg-[#2286FE] disabled:opacity-50 transition"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1419] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-[#D1D5DB] bg-clip-text text-transparent">
            Top Rated Movies
          </h1>
          <p className="text-lg text-[#B0B5C2]">
            The highest rated films according to TMDb users
          </p>
        </header>

        <Pagination />

        {loading ? (
          <SkeletonLoader />
        ) : movies?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-8">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                rating={movie.vote_average}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-[#D1D5DB] mb-4">No movies found</p>
            <p className="text-[#B0B5C2]">
              Unable to load top rated movies at this time.
            </p>
          </div>
        )}

        {movies?.length > 0 && <Pagination />}
      </div>
    </div>
  );
};

export default TopRatedMoviesPage;
