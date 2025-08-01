import React, { useState, useEffect } from "react";

const CastDetails = ({ movie_id }) => {
  const [cast, setCast] = useState([]);

  useEffect(() => {
    const fetchCastDetails = async () => {
      try {
        const Api_key = "API";
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${Api_key}&language=en-US`
        );
        const data = await response.json();
        setCast(data.cast || []);
      } catch (error) {
        console.error("Error fetching cast details:", error);
      }
    };

    if (movie_id) {
      fetchCastDetails();
    }
  }, [movie_id]);

  const fallbackImage = "https://via.placeholder.com/500x500?text=No+Image";

  return (
    <div>
      <h2 className="px-4 text-2xl font-semibold">Cast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {cast.map((actor) => (
          <div
            key={actor.id}
            className="w-full bg-white rounded-lg overflow-hidden shadow-lg"
          >
            <img
              src={
                actor.profile_path
                  ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                  : fallbackImage
              }
              alt={actor.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {actor.name}
              </h3>
              <p className="text-gray-600">Character: {actor.character}</p>
              <p className="text-gray-500">
                Popularity:{" "}
                {actor.popularity ? actor.popularity.toFixed(2) : "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastDetails;
