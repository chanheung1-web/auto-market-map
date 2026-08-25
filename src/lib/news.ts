import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { COMPANIES } from "./companies";

// 隣のフォルダ auto-industry-watcher が毎朝ためている JSONL を、ファイルとして
// 直接読む。stock-trading-app が ../market-briefing を読んでいるのと同じ方式で、
// GitHub API ではないのでトークンは要らない。
//
// あちらの収集エージェントは「既存行を書き換えない・追記のみ」という規約で動いて
// いるので、こちらは読み取り専用に徹する。**このアプリから data/news/ に書かない。**
const NEWS_DIR = path.join(process.cwd(), "..", "auto-industry-watcher", "data", "news");

/** auto-industry-watcher の auto-news-collector が書くレコード。 */
export type NewsRecord = {
  id: string;
  date: string;
  company: string[];
  tickers: string[];
  tags: string[];
  headline: string;
  summary: string;
  impact: string;
  primary_source: string;
  related_urls?: string[];
  confidence: string;
  follow_up_to: string | null;
  collected_at: string;
};

/** UI に渡す形。どの監視対象企業に紐づくかを解決済みにしてある。 */
export type NewsItem = NewsRecord & { companyIds: string[] };

// ニュース側の tickers は "7203" のような素の証券コードだが、こちらの code は
// Yahoo シンボル "7203.T" なので、そのままでは突き合わせられない。
const BY_TICKER_PREFIX = new Map<string, string>();
const BY_NAME = new Map<string, string>();
for (const c of COMPANIES) {
  if (c.code) BY_TICKER_PREFIX.set(c.code.split(".")[0], c.id);
  BY_NAME.set(c.name, c.id);
}

// auto-industry-watcher 側の表記とこちら側の表記が食い違う分だけを手当てする。
// （あちらは正式社名、こちらは通称を使っている箇所がある）
const NAME_ALIASES: Record<string, string> = {
  ホンダ: "honda",
  本田技研工業: "honda",
  三菱自動車工業: "mitsubishi-motors",
  フォルクスワーゲン: "vw",
  ゼネラルモーターズ: "gm",
  テスラ: "tesla",
  "BYD Company": "byd",
};

function resolveCompanyIds(rec: NewsRecord): string[] {
  const ids = new Set<string>();
  for (const t of rec.tickers ?? []) {
    const id = BY_TICKER_PREFIX.get(t);
    if (id) ids.add(id);
  }
  for (const name of rec.company ?? []) {
    const id = BY_NAME.get(name) ?? NAME_ALIASES[name];
    if (id) ids.add(id);
  }
  return Array.from(ids);
}

/**
 * 直近のニュースを新しい順に返す。
 *
 * auto-industry-watcher が無い／まだ1件も収集していない環境でも、このアプリ自体は
 * 株価だけで成立する。そのため読めない場合は throw せず空配列を返す。
 */
export async function loadRecentNews(limit = 60): Promise<NewsItem[]> {
  let files: string[];
  try {
    files = (await readdir(NEWS_DIR)).filter((f) => f.endsWith(".jsonl")).sort().reverse();
  } catch {
    return [];
  }

  const items: NewsItem[] = [];
  // ファイルは YYYY-MM.jsonl なので、新しい月から読めば limit 件に早く到達する。
  for (const file of files) {
    let raw: string;
    try {
      raw = await readFile(path.join(NEWS_DIR, file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const rec = JSON.parse(trimmed) as NewsRecord;
        items.push({ ...rec, companyIds: resolveCompanyIds(rec) });
      } catch {
        // 1行が壊れていても残りは読めるので、その行だけ捨てる。
      }
    }
    if (items.length >= limit * 2) break;
  }

  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
