"use client";
import React, { useEffect, useState } from "react";
import MovieCard from "./components/MovieCard";
import { useSearchParams } from "next/navigation";

const HomePage = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [allMovies, setAllMovies] = useState(null);
  const [loading, setLoading] = useState(true);
  const search = useSearchParams().get("search");

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let APIURL = "";

      if (search) {
        APIURL = `/api/movies/search?query=${encodeURIComponent(
          search
        )}&page=${page}`;
      } else {
        APIURL = `/api/movies/popular?page=${page}`;
      }

      const response = await fetch(APIURL);
      const data = await response.json();
      setAllMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, search]);

  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl animate-pulse border border-slate-700/30"
        >
          <div className="aspect-[2/3] bg-gradient-to-br from-slate-700/50 to-slate-800/50"></div>
          <div className="p-6 space-y-3">
            <div className="h-5 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg w-4/5"></div>
            <div className="h-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const Pagination = () => (
    <div className="flex justify-center items-center gap-6 my-8">
      <button
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        disabled={page === 1}
        className="group relative px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/30 hover:from-blue-600 hover:to-purple-600"
      >
        <span className="relative z-10">Previous</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      <div className="px-6 py-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm text-slate-200 rounded-2xl font-medium border border-slate-600/30">
        Page <span className="text-blue-400 font-bold">{page}</span> of{" "}
        <span className="text-purple-400 font-bold">{totalPages}</span>
      </div>

      <button
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={page === totalPages}
        className="group relative px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/30 hover:from-blue-600 hover:to-purple-600"
      >
        <span className="relative z-10">Next</span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] pointer-events-none"></div>

        <div className="relative max-w-8xl mx-auto px-6 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent tracking-tight">
              {search ? "Search Results" : "Popular Movies"}
            </h1>
            {search && (
              <p className="text-lg text-slate-400">
                Showing results for{" "}
                <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold">
                  "{search}"
                </span>
              </p>
            )}
          </div>

          <Pagination />

          {/* Content */}
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {allMovies?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-700 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 7v10h6V7H9z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-300 mb-3">
                    No movies found
                  </h2>
                  <p className="text-slate-500">
                    Try adjusting your search or browse popular titles.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                  {allMovies?.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      id={movie.id}
                      title={movie.title}
                      posterUrl={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      rating={movie.vote_average}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && allMovies?.length > 0 && <Pagination />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
