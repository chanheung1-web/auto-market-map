// 銘柄検索。社名（日本語可）でも証券コードでも引ける。
// 手でシンボルを打たせると `.T` の付け忘れが起きるので、検索から選ばせる。
//
// 二段構えになっているのは、Yahoo の英語版検索が**日本語の社名をまったく
// 索引していない**ため。「東海理化」「トヨタ」「デンソー」はいずれも0件で返る
// （stock-trading-app の symbol-search も同じ制約を持っている）。
// そこで日本語が含まれるときだけ Yahoo!ファイナンス日本版で証券コードを引き、
// そのコードを英語版に流し込んで正式名称と取引所を得る。

type YahooSearchQuote = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  typeDisp?: string;
  quoteType?: string;
};

export type SearchResult = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;
const UA = { "User-Agent": "Mozilla/5.0" };

// 監視対象にするのは事業会社なので、投信・先物・オプション・通貨は落とす。
// 検索語が短いとこれらが上位を埋めて、目的の銘柄が見えなくなる。
const EXCLUDED_TYPES = new Set(["FUTURE", "OPTION", "MUTUALFUND", "CURRENCY", "ECNQUOTE"]);

function toResults(quotes: YahooSearchQuote[]): SearchResult[] {
  return quotes
    .filter((x) => x.symbol)
    .filter((x) => !EXCLUDED_TYPES.has(x.quoteType ?? ""))
    .map((x) => ({
      symbol: x.symbol as string,
      name: x.longname ?? x.shortname ?? (x.symbol as string),
      exchange: x.exchDisp ?? "",
      type: x.typeDisp ?? x.quoteType ?? "",
    }));
}

async function searchGlobal(q: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`,
    { headers: UA, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return toResults(data.quotes ?? []);
}

/** ひらがな・カタカナ・漢字が含まれるか。 */
function hasJapanese(s: string): boolean {
  return /[぀-ヿ㐀-䶿一-鿿]/.test(s);
}

/**
 * Yahoo!ファイナンス日本版の検索結果ページから証券コードを拾う。
 *
 * JSON API が公開されていないためHTMLを読む。壊れやすい経路なので、
 * ここが失敗しても検索全体は落とさない（英語版の結果だけ返す）。
 * 拾うのは `/quote/6995` の形のリンクで、コードは4桁（末尾が英字の
 * 新形式 543A も含む）。
 */
async function searchJapaneseCodes(q: string): Promise<string[]> {
  const res = await fetch(`https://finance.yahoo.co.jp/search/?query=${encodeURIComponent(q)}`, {
    headers: UA,
    cache: "no-store",
  });
  if (!res.ok) return [];
  const html = await res.text();
  const codes = [...html.matchAll(/\/quote\/([0-9][0-9A-Z]{3})(?:\.T)?["/?]/g)].map((m) => m[1]);
  // 上位数件で十分。1コードにつき英語版へ1回問い合わせるので、増やすと待ち時間に直結する。
  return [...new Set(codes)].slice(0, 6);
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q");
  if (!q || q.trim().length === 0) {
    return Response.json({ results: [] }, { headers: NO_STORE });
  }
  const query = q.trim();

  try {
    // 英語版は日本語クエリに 400 を返すことがある（0件ではなくエラー）。
    // ここで throw させると日本語のフォールバックに到達しないので、
    // 失敗も「0件」として扱って先へ進める。
    const primary = await searchGlobal(query).catch(() => [] as SearchResult[]);
    if (primary.length > 0 || !hasJapanese(query)) {
      return Response.json({ results: primary }, { headers: NO_STORE });
    }

    // 日本語で0件だった場合のみ、日本版から回り込む。
    const codes = await searchJapaneseCodes(query);
    const resolved = await Promise.all(
      codes.map((code) =>
        searchGlobal(code)
          // 日本版が返したコードなので、東証の行だけを採る。
          .then((rs) => rs.find((r) => r.symbol === `${code}.T`) ?? null)
          .catch(() => null)
      )
    );

    return Response.json(
      { results: resolved.filter((r): r is SearchResult => r !== null) },
      { headers: NO_STORE }
    );
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "unknown error", results: [] },
      { status: 500, headers: NO_STORE }
    );
  }
}
