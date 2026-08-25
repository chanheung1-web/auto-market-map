import { listedCompanies } from "@/lib/companies";
import { fetchQuotes } from "@/lib/yahooFinance";

// Route Handler は既定でキャッシュされない（Next 16）。実際のキャッシュは
// fetchQuotes 内の fetch が持つ 60 秒の data cache 側で効く。画面は 60 秒ごとに
// ポーリングするので、そこで Yahoo を叩き直す頻度を抑えている。
export async function GET() {
  const symbols = listedCompanies().map((c) => c.code!);
  const quotes = await fetchQuotes(symbols);
  return Response.json(
    { quotes, fetchedAt: Date.now() },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
