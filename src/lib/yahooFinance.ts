// Yahoo Finance の非公式 chart エンドポイント。APIキー不要だが、ドキュメント化も
// サポートもされていないため、予告なく仕様変更やレート制限が入りうる。
// stock-trading-app の src/lib/yahooFinance.ts と同じ作りだが、あちらは
// 保有銘柄の詳細（アナリスト目標株価・決算日）まで扱うのに対し、こちらは
// 地図と一覧に必要な「現在値と前日比」だけに絞っている。

const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

/** 1銘柄ぶんの見積もり。取得に失敗しても throw せず error を載せて返す。 */
export type Quote = {
  symbol: string;
  price: number | null;
  changePercent: number | null;
  currency?: string;
  /** 実際に約定した時刻(epoch ms)。取得時刻ではない。市場が閉じていれば何時間も前になる。 */
  quoteTime?: number | null;
  error?: string;
};

type YahooChartMeta = {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  currency?: string;
  regularMarketTime?: number;
};

type YahooChartResponse = {
  chart: {
    result?: [{ meta: YahooChartMeta }];
    error?: { description?: string };
  };
};

async function fetchOne(symbol: string, revalidateSeconds: number): Promise<Quote> {
  try {
    const res = await fetch(
      `${YAHOO_CHART_BASE_URL}/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: revalidateSeconds },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: YahooChartResponse = await res.json();
    const meta = data.chart.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== "number") {
      throw new Error(data.chart.error?.description ?? "no data");
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;

    return {
      symbol,
      price,
      changePercent:
        typeof prevClose === "number" && prevClose !== 0
          ? ((price - prevClose) / prevClose) * 100
          : null,
      currency: meta.currency,
      quoteTime:
        typeof meta.regularMarketTime === "number" ? meta.regularMarketTime * 1000 : null,
    };
  } catch (err) {
    return {
      symbol,
      price: null,
      changePercent: null,
      error: err instanceof Error ? err.message : "fetch failed",
    };
  }
}

// 監視対象は100銘柄近くあり、全部を同時に投げると Yahoo 側に弾かれる。
// 少しずつ束ねて順に流すことで、1画面ぶんの取得を現実的な失敗率に収める。
const BATCH_SIZE = 12;

/**
 * 複数シンボルをまとめて取得する。個別の失敗は error 付きの Quote として返るので、
 * 呼び出し側は「一部が取れない」状態を常に扱えるようにしておくこと。
 */
export async function fetchQuotes(
  symbols: readonly string[],
  revalidateSeconds = 60
): Promise<Quote[]> {
  const out: Quote[] = [];
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    out.push(...(await Promise.all(batch.map((s) => fetchOne(s, revalidateSeconds)))));
  }
  return out;
}
