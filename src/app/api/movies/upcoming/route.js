export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || 1;

  const apiKey = process.env.TMDB_API_KEY;

  const tmdbUrl = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=${page}`;

  const res = await fetch(tmdbUrl);
  const data = await res.json();

  return Response.json(data);
}
