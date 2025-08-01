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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        {search ? `Search Results for: ${search}` : "Popular Movies"}
      </h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-l-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 bg-gray-200 text-gray-800">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-5">
          {allMovies?.length === 0
            ? "No movies found"
            : allMovies?.map((movie, index) => (
                <MovieCard
                  key={index}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  rating={movie.vote_average}
                />
              ))}
        </div>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-l-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 bg-gray-200 text-gray-800">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default HomePage;
