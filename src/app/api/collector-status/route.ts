import { loadCollectorStatus } from "@/lib/collectorStatus.server";

export async function GET() {
  const status = await loadCollectorStatus();
  return Response.json(status, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
