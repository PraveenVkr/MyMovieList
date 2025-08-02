"use client";
import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard"; // adjust path if needed

const SimilarMovies = ({ movieId }) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);

    fetch(`/api/movies/${movieId}/similar`)
      .then((res) => res.json())
      .then((data) => {
        setSimilar(data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setSimilar([]);
        setLoading(false);
      });
  }, [movieId]);

  if (loading) {
    return <div className="p-6 text-slate-400">Loading similar movies...</div>;
  }

  if (!similar.length) {
    return null; // Or display <div>No similar movies found</div>
  }

  return (
    <div className="py-10">
      <h2 className="text-2xl font-bold mb-6 text-[#FFC857]">Similar Movies</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-8">
        {similar.slice(0, 12).map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterUrl={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
            rating={movie.vote_average}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarMovies;
