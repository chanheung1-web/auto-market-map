import { loadTopics } from "@/lib/topics.server";

export async function GET() {
  const topics = await loadTopics();
  return Response.json(topics, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
