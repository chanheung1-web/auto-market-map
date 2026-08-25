import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { RECENT_DAYS, resolveCompanyIds, type NewsItem, type NewsRecord } from "./news";

// 隣のフォルダ auto-industry-watcher が毎朝ためている JSONL を、ファイルとして
// 直接読む。stock-trading-app が ../market-briefing を読んでいるのと同じ方式で、
// GitHub API ではないのでトークンは要らない。
//
// あちらの収集エージェントは「既存行を書き換えない・追記のみ」という規約で動いて
// いるので、こちらは読み取り専用に徹する。**このアプリから data/news/ に書かない。**
const NEWS_DIR = path.join(process.cwd(), "..", "auto-industry-watcher", "data", "news");

/**
 * days 日前の日付を YYYY-MM-DD で返す。
 *
 * `toISOString()` を使ってはいけない。あれはUTCに変換するため、日本時間の
 * 早朝に実行すると日付が1日前にずれる（JSTはUTC+9なので 8/26 02:00 JST は
 * UTC では 8/25）。JSONL の `date` は日本時間の暦日なので、こちらも
 * ローカルの暦日で組み立てて揃える。
 */
function cutoffDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * 直近 RECENT_DAYS 日ぶんのニュースを新しい順に返す。
 *
 * 件数では打ち切らない。1日あたり3〜6件の収集ペースなので期間で切れば自然に
 * 200件程度に収まり、「表示件数の上限で消えた」のか「その企業に最近ニュースが
 * ないのか」が区別できなくなる事態を避けられる。
 *
 * auto-industry-watcher が無い／まだ1件も収集していない環境でも、このアプリ自体は
 * 株価だけで成立する。そのため読めない場合は throw せず空配列を返す。
 */
export async function loadRecentNews(days = RECENT_DAYS): Promise<NewsItem[]> {
  let files: string[];
  try {
    files = (await readdir(NEWS_DIR)).filter((f) => f.endsWith(".jsonl")).sort().reverse();
  } catch {
    return [];
  }

  const cutoff = cutoffDate(days);
  const items: NewsItem[] = [];

  // ファイルは YYYY-MM.jsonl。新しい月から読み、対象期間より前の月に届いたら
  // それ以降のファイルは丸ごと読む必要がない。
  for (const file of files) {
    if (file.replace(/\.jsonl$/, "") < cutoff.slice(0, 7)) break;

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
        if (!rec.date || rec.date < cutoff) continue;
        items.push({ ...rec, companyIds: resolveCompanyIds(rec) });
      } catch {
        // 1行が壊れていても残りは読めるので、その行だけ捨てる。
      }
    }
  }

  return items.sort((a, b) => b.date.localeCompare(a.date));
}
