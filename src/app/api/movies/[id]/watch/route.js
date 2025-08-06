// app/api/movies/[id]/watch/route.js

export async function GET(request, { params }) {
  const { id } = params;
  const apiKey = process.env.TMDB_API_KEY;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing movie ID" }), {
      status: 400,
    });
  }

  try {
    const url = `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apiKey}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch from TMDb" }),
        { status: 500 }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
