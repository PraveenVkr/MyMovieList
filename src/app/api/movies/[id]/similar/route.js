export async function GET(request, { params }) {
  const { id } = params;

  const API_KEY = process.env.TMDB_API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // You can also add pagination: const page = new URL(request.url).searchParams.get('page') || 1;
    const tmdbUrl = `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}&language=en-US`;
    const response = await fetch(tmdbUrl);

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch similar movies" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
