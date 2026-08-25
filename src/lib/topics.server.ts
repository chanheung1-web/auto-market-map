import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { TopicReport } from "./topics";

// auto-industry-watcher の auto-digest-writer / auto-news-collector が書く
// Markdown レポート。JSONL の生ニュースが「1件ずつの事実」なのに対し、
// こちらは**論点として編集済み**のもの。重要度が違うので画面上も別枠で扱う。
//
// 週次は「今週の3大トピック」まで人が絞り込んだ結果なので、個別ニュースより
// 優先して見せる価値がある。
const REPORTS_DIR = path.join(process.cwd(), "..", "auto-industry-watcher", "reports");


function stripTitle(raw: string): { title: string; body: string } {
  const lines = raw.split("\n");
  const i = lines.findIndex((l) => l.startsWith("# "));
  if (i === -1) return { title: "", body: raw.trim() };
  return {
    title: lines[i].replace(/^#\s+/, "").trim(),
    body: lines.slice(i + 1).join("\n").trim(),
  };
}

/**
 * ISO週番号 "2026-W34" を、その週の月曜日の日付に直す。
 *
 * 週次と日次を1つの時系列に混ぜて並べるために必要。文字列のまま比較すると
 * "2026-W34" が "2026-08-25" より後ろに来てしまう（"W" > "0"）。
 */
function weekIdToDate(id: string): string {
  const m = /^(\d{4})-W(\d{2})$/.exec(id);
  if (!m) return id;
  const [, year, week] = m;
  // ISO 8601: 第1週は最初の木曜日を含む週。1月4日は必ず第1週に入る。
  const jan4 = new Date(Date.UTC(Number(year), 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7; // 日曜=0 を 7 に寄せる
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Dow + 1);
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (Number(week) - 1) * 7);
  return monday.toISOString().slice(0, 10);
}

async function loadKind(kind: "weekly" | "daily", limit: number): Promise<TopicReport[]> {
  const dir = path.join(REPORTS_DIR, kind);
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort().reverse();
  } catch {
    return [];
  }

  const out: TopicReport[] = [];
  for (const file of files.slice(0, limit)) {
    try {
      const raw = await readFile(path.join(dir, file), "utf8");
      const id = file.replace(/\.md$/, "");
      const { title, body } = stripTitle(raw);
      out.push({
        kind,
        id,
        title: title || id,
        body,
        sortKey: kind === "weekly" ? weekIdToDate(id) : id,
      });
    } catch {
      // 1ファイル読めなくても残りは出せるので、そのファイルだけ捨てる。
    }
  }
  return out;
}

/**
 * 直近のダイジェストを新しい順に返す。
 *
 * 週次は最新4本（約1か月ぶん）、日次は最新7本。日次は毎日出るため多く持つと
 * 画面が埋まるだけで、古い日次を読み返す用途はレポートのファイルを直接開く方が早い。
 */
export async function loadTopics(): Promise<{ weekly: TopicReport[]; daily: TopicReport[] }> {
  const [weekly, daily] = await Promise.all([loadKind("weekly", 4), loadKind("daily", 7)]);
  return { weekly, daily };
}
