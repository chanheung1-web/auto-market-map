import type { Company, Layer, Region } from "./companies";
import type { Quote } from "./yahooFinance";

export const REGION_ORDER: Region[] = ["米国", "欧州", "日本", "韓国", "中国", "インド"];

// WorldMapSilhouette と同じ 1000x500 の Natural Earth 投影空間を、パーセントで
// 表したもの（SVG が preserveAspectRatio="none" なので座標系がコンテナの
// パーセントに 1:1 で対応する）。stock-trading-app の GlobalMarketSummary から
// 座標を引き継ぎ、インドを追加した。
//
// 日本・韓国・中国は真の縮尺だとバッジが重なって読めないため、実際の相対方位
// （日本は韓国の東、韓国は中国の北）を保ったまま離してある。
export const REGION_POSITION: Record<Region, { left: string; top: string }> = {
  米国: { left: "31%", top: "25%" },
  欧州: { left: "53%", top: "20%" },
  韓国: { left: "80%", top: "16%" },
  日本: { left: "92%", top: "24%" },
  中国: { left: "70%", top: "33%" },
  インド: { left: "64%", top: "45%" },
};

export type RegionSummary = {
  region: Region;
  /** 騰落率の単純平均(%)。取得できた銘柄がなければ null。 */
  avgChangePercent: number | null;
  /** 平均の母数になった銘柄数。 */
  quotedCount: number;
  /** その地域の上場企業数（取得失敗を含む）。 */
  listedCount: number;
  /** 上げた銘柄数 / 下げた銘柄数。地図の色だけでは潰れる「割れ方」を見るため。 */
  advancers: number;
  decliners: number;
};

/**
 * 地域ごとに騰落率を集計する。
 *
 * 時価総額加重ではなく**単純平均**にしている。時価総額を取るには銘柄ごとに追加の
 * API を叩く必要があり、更新のたびに往復が倍になるうえ、加重すると日本＝トヨタ、
 * 米国＝テスラの動きにほぼ一致してしまい「地域の中で何が起きているか」が見えなく
 * なるため。つまりこの平均は指数の代用ではなく、**監視対象の広がり方**を示す。
 */
export function summarizeRegions(
  companies: Company[],
  quotes: Map<string, Quote>,
  layerFilter: Layer | "ALL"
): RegionSummary[] {
  return REGION_ORDER.map((region) => {
    const members = companies.filter(
      (c) =>
        c.region === region &&
        c.code !== null &&
        (layerFilter === "ALL" || c.layer === layerFilter)
    );

    const changes = members
      .map((c) => quotes.get(c.code!)?.changePercent)
      .filter((v): v is number => typeof v === "number");

    return {
      region,
      avgChangePercent:
        changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : null,
      quotedCount: changes.length,
      listedCount: members.length,
      advancers: changes.filter((v) => v > 0).length,
      decliners: changes.filter((v) => v < 0).length,
    };
  });
}

/**
 * 騰落率を色に落とす。±2% で振り切る段階色。
 *
 * 個別銘柄なら1日で±2%は珍しくないが、ここで着色するのは十数銘柄の平均なので、
 * 地域平均が±2%に達するのは「その地域がまとめて動いた日」だけになる。
 */
export function toneFor(changePercent: number | null): string {
  if (changePercent === null) return "border-zinc-700 bg-zinc-800/80 text-zinc-400";
  if (changePercent >= 2) return "border-emerald-500 bg-emerald-600/80 text-emerald-50";
  if (changePercent >= 0.5) return "border-emerald-600 bg-emerald-800/80 text-emerald-100";
  if (changePercent > 0) return "border-emerald-700 bg-emerald-900/70 text-emerald-200";
  if (changePercent === 0) return "border-zinc-600 bg-zinc-800/80 text-zinc-300";
  if (changePercent > -0.5) return "border-red-800 bg-red-950/70 text-red-200";
  if (changePercent > -2) return "border-red-700 bg-red-900/80 text-red-100";
  return "border-red-500 bg-red-700/80 text-red-50";
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
