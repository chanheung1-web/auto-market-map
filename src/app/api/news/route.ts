import { loadRecentNews } from "@/lib/news";

export async function GET() {
  const news = await loadRecentNews();
  return Response.json({ news }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
