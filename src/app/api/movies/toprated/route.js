export async function GET() {
  const API_KEY = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`; //

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch top rated movies");
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch top rated movies" }),
      { status: 500 }
    );
  }
}
