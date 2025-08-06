import React, { useEffect, useState } from "react";

const WatchProvidersBox = ({ movieId }) => {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/movies/${movieId}/watch`);
        if (!res.ok) throw new Error("Error fetching streaming providers");
        const data = await res.json();
        setProviders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) fetchProviders();
  }, [movieId]);

  if (loading)
    return <div className="mt-5">Checking streaming providers...</div>;
  if (error) return <div className="mt-5 text-red-400">❌ {error}</div>;
  if (!providers || !providers.results)
    return <div className="mt-5">No streaming information found.</div>;

  // For example, show only providers in US/IN; adjust country code as needed.
  const country = providers.results.IN || providers.results.US;

  if (!country)
    return <div className="mt-5">No streaming info for your region.</div>;

  const { flatrate, rent, buy } = country;

  return (
    <div className="mt-5 p-4 bg-[#232A34] rounded-2xl border border-[#2D3748]">
      <h3 className="text-lg font-bold mb-3 text-[#FFC857]">Where to Stream</h3>
      {flatrate && (
        <div>
          <span className="font-medium text-green-400">
            Available to stream:
          </span>
          <div className="flex flex-wrap gap-3 mt-2">
            {flatrate.map((provider) => (
              <div
                key={provider.provider_id}
                className="flex items-center gap-2"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-7 h-7 rounded-md"
                />
                <span>{provider.provider_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {rent && (
        <div className="mt-4">
          <span className="font-medium text-yellow-400">
            Available to rent:
          </span>
          <div className="flex flex-wrap gap-3 mt-2">
            {rent.map((provider) => (
              <div
                key={provider.provider_id}
                className="flex items-center gap-2"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-7 h-7 rounded-md"
                />
                <span>{provider.provider_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {buy && (
        <div className="mt-4">
          <span className="font-medium text-blue-400">Available to buy:</span>
          <div className="flex flex-wrap gap-3 mt-2">
            {buy.map((provider) => (
              <div
                key={provider.provider_id}
                className="flex items-center gap-2"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-7 h-7 rounded-md"
                />
                <span>{provider.provider_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchProvidersBox;
