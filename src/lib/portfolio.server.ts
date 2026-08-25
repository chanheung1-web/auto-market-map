import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeCode, type PortfolioLink } from "./portfolio";

// 保有銘柄とウォッチリストは stock-trading-app が持っているものが正。
// あちらは PC と iPhone の両方から編集されるため「サーバー側の data/*.json が正、
// localStorage は端末ごとのキャッシュ」という設計になっている。
// こちらはその正本を隣フォルダから読むだけにする。**二重管理しないこと。**
//
// ハードコードした保有フラグを持っていた時期があったが、実際の保有と食い違った
// （トヨタ・日本製鉄を保有扱いにしていたが、実際に保有しているのは日産だった）。
// 保有情報を静的データとして持たないのはこのため。
const PORTFOLIO_DIR = path.join(process.cwd(), "..", "stock-trading-app", "data");

type HoldingRecord = { code?: string; name?: string; quantity?: number };
type WatchlistRecord = { code?: string; name?: string };

async function readJsonArray<T>(file: string): Promise<T[]> {
  const raw = await readFile(path.join(PORTFOLIO_DIR, file), "utf8");
  const parsed: unknown = JSON.parse(raw);
  // stock-trading-app 側は「素のJSON配列を保つこと」という規約で運用されている
  // （sync-tickers.mjs 等が直接読むため）。想定外の形なら空として扱う。
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

/**
 * 保有・ウォッチ状況を読む。
 *
 * stock-trading-app が無い環境でもこのアプリは成立する必要があるため、
 * 読めない場合は throw せず error を載せた空の結果を返す。
 */
export async function loadPortfolioLink(): Promise<PortfolioLink> {
  const heldQuantityByCode: Record<string, number> = {};
  const watchedCodes: string[] = [];

  try {
    for (const h of await readJsonArray<HoldingRecord>("holdings.json")) {
      // 投資信託は code に商品名がそのまま入っている（"ｅＭＡＸＩＳ Ｓｌｉｍ…"）。
      // 個別株のコードとは突き合わないが、除外しても実害がないので素通しする。
      if (!h.code) continue;
      const key = normalizeCode(h.code);
      heldQuantityByCode[key] = (heldQuantityByCode[key] ?? 0) + (h.quantity ?? 0);
    }
    for (const w of await readJsonArray<WatchlistRecord>("watchlist.json")) {
      if (w.code) watchedCodes.push(normalizeCode(w.code));
    }
    return { heldQuantityByCode, watchedCodes, error: null };
  } catch (err) {
    return {
      heldQuantityByCode: {},
      watchedCodes: [],
      error: err instanceof Error ? err.message : "読み取りに失敗しました",
    };
  }
}
