"use client";
import React, { useState, useEffect } from "react";

const CastDetails = ({ movie_id }) => {
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCastDetails = async () => {
      if (!movie_id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/movies/${movie_id}/credits`);

        if (!response.ok) {
          throw new Error("Failed to fetch cast details");
        }

        const data = await response.json();
        setCast(data.cast || []);
      } catch (error) {
        console.error("Error fetching cast details:", error);
        setError(error.message);
        setCast([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCastDetails();
  }, [movie_id]);

  const fallbackImage =
    "https://via.placeholder.com/300x450/232A34/D1D5DB?text=No+Image";

  // Loading skeleton
  const SkeletonLoader = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 p-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#232A34]/50 rounded-2xl overflow-hidden shadow-lg animate-pulse"
        >
          <div className="h-48 bg-[#232A34]/80"></div>
          <div className="p-4 space-y-2">
            <div className="h-4 bg-[#232A34]/80 w-3/4 rounded"></div>
            <div className="h-3 bg-[#232A34]/60 w-1/2 rounded"></div>
            <div className="h-3 bg-[#232A34]/60 w-1/3 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#0F1419]">
        <h2 className="px-6 py-4 text-3xl font-bold text-[#FFC857]">Cast</h2>
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0F1419] p-6">
        <h2 className="px-6 py-4 text-3xl font-bold text-[#FFC857]">Cast</h2>
        <div className="text-center py-8">
          <p className="text-red-400 text-lg">Error loading cast details</p>
          <p className="text-[#B0B5C2] mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!cast.length) {
    return (
      <div className="bg-[#0F1419] p-6">
        <h2 className="px-6 py-4 text-3xl font-bold text-[#FFC857]">Cast</h2>
        <div className="text-center py-8">
          <p className="text-[#D1D5DB] text-lg">
            No cast information available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1419]">
      <h2 className="px-6 py-4 text-3xl font-bold text-[#FFC857]">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 p-6">
        {cast.slice(0, 12).map((actor) => (
          <div
            key={actor.id}
            className="bg-[#232A34] text-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div className="relative">
              <img
                src={
                  actor.profile_path
                    ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
                    : fallbackImage
                }
                alt={actor.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-base font-semibold text-white line-clamp-1">
                {actor.name}
              </h3>
              <p className="text-[#D1D5DB] text-sm line-clamp-2">
                {actor.character}
              </p>
              {actor.popularity && (
                <div className="flex items-center text-xs text-[#B0B5C2]">
                  <span className="text-[#FFC857]">★</span>
                  <span className="ml-1">{actor.popularity.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastDetails;
