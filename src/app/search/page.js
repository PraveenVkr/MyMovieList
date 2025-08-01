"use client";
import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { useSearchParams } from "next/navigation";

const SearchPage = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [allMovies, setAllMovies] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract the search query from URL (?search=term)
  const search = useSearchParams().get("search");

  const fetchMovies = async () => {
    if (!search) {
      setAllMovies([]);
      setTotalPages(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const APIURL = `/api/movies/search?query=${encodeURIComponent(
        search
      )}&page=${page}`;

      const response = await fetch(APIURL);
      const data = await response.json();
      setAllMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      setAllMovies([]);
      setTotalPages(0);
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const SkeletonLoader = () => (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="w-full bg-gray-200 rounded-lg overflow-hidden shadow-lg animate-pulse"
        >
          <div className="h-64 bg-gray-300"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-300 w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Pagination component
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
            {search ? `Search Results` : "Search Movies"}
          </h1>
          {search && (
            <p className="text-lg text-[#B0B5C2]">
              Showing results for{" "}
              <span className="text-[#FFC857] font-semibold">"{search}"</span>
            </p>
          )}
        </header>

        {search && <Pagination />}

        <main>
          {loading ? (
            <SkeletonLoader />
          ) : allMovies?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {allMovies.map((movie) => (
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
                Try a different search or check popular titles.
              </p>
            </div>
          )}
        </main>

        {search && !loading && allMovies?.length > 0 && <Pagination />}
      </div>
    </div>
  );
};

export default SearchPage;
