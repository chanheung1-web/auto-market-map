import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CollectorStatus } from "./collectorStatus";

// 隣の auto-industry-watcher が毎朝のタスクで書くログを読み、収集が止まって
// いないかを判定する。
//
// これがあるのは、2026-09-19 から 9-28 まで**10日間ニュース収集が止まっていたのに
// 画面からは何も分からなかった**ため。原因は無人実行の Claude Code CLI の
// ログインが切れたことで、ログには毎朝
//   Failed to authenticate: OAuth session expired and could not be refreshed
// と出ていたが、ログを開かないかぎり気づけない。アプリは古いニュースを
// 正常なものとして表示し続けていた。
const LOG_DIR = path.join(process.cwd(), "..", "auto-industry-watcher", "logs");

/** ローカルの暦日 YYYY-MM-DD（toISOString は UTC にずれるので使わない）。 */
function localDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

type RunResult = { date: string; exitCode: number | null; authFailed: boolean; limitHit: boolean };

async function readRun(file: string): Promise<RunResult | null> {
  const m = file.match(/^(\d{4}-\d{2}-\d{2})\.log$/);
  if (!m) return null;
  let text: string;
  try {
    text = await readFile(path.join(LOG_DIR, file), "utf8");
  } catch {
    return null;
  }
  // 1日に複数回走ることがある（手動の再実行など）。最後の実行の結果で判定する。
  const codes = [...text.matchAll(/exit code (-?\d+)/g)];
  const last = codes.length ? Number(codes[codes.length - 1][1]) : null;
  const lastRunStart = text.lastIndexOf("daily collector start");
  const lastRunText = lastRunStart >= 0 ? text.slice(lastRunStart) : text;
  return {
    date: m[1],
    exitCode: last,
    authFailed: /Failed to authenticate|OAuth session expired/i.test(lastRunText),
    // 2026-10-04 に初めて出た。認証は生きているが、その時点の使用量が上限に
    // 達していて弾かれる。リセットを待てば通るが、定期タスクは再試行しないので
    // その日の収集は手動で取り直さないかぎり欠ける。
    limitHit: /session limit|usage limit|rate limit/i.test(lastRunText),
  };
}

/**
 * 日次収集の健全性を返す。
 *
 * 見ているのは3点。
 *  1. 直近の実行が失敗していないか（exit code）
 *  2. その失敗が認証切れか（対処が「ログインし直す」だけなので特定して出す）
 *  3. そもそも実行されていないか（PCの電源断・タスク無効化など）
 *
 * auto-industry-watcher が無い環境でもアプリは株価だけで成立するので、
 * ログが読めないときは「判定不能」を返し、エラー扱いにはしない。
 */
export async function loadCollectorStatus(now = new Date()): Promise<CollectorStatus> {
  let files: string[];
  try {
    files = (await readdir(LOG_DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}\.log$/.test(f)).sort();
  } catch {
    return { state: "unknown", message: null, lastSuccess: null, failingDays: 0 };
  }
  if (files.length === 0) {
    return { state: "unknown", message: null, lastSuccess: null, failingDays: 0 };
  }

  const runs = (await Promise.all(files.map(readRun))).filter((r): r is RunResult => r !== null);
  const today = localDate(now);
  const latest = runs[runs.length - 1];

  // 直近から遡って、連続で失敗している日数を数える。
  let failingDays = 0;
  let lastSuccess: string | null = null;
  for (let i = runs.length - 1; i >= 0; i--) {
    if (runs[i].exitCode === 0) {
      lastSuccess = runs[i].date;
      break;
    }
    failingDays++;
  }

  if (latest.exitCode !== 0 && latest.exitCode !== null) {
    if (latest.authFailed) {
      return {
        state: "auth",
        message: `ニュース収集が認証切れで止まっています（${failingDays}日連続）。Claude Code を一度開いてログインし直すと、翌朝から復旧します。`,
        lastSuccess,
        failingDays,
      };
    }
    if (latest.limitHit) {
      return {
        state: "limit",
        message: `今朝のニュース収集が使用量の上限で失敗しました。上限のリセット後に auto-industry-watcher/scripts/run-daily-collector.ps1 を手動で実行すると、今日の分を取り直せます（翌朝は自動で再開します）。`,
        lastSuccess,
        failingDays,
      };
    }
    return {
      state: "failing",
      message: `ニュース収集が失敗しています（${failingDays}日連続）。auto-industry-watcher/logs/${latest.date}.log を確認してください。`,
      lastSuccess,
      failingDays,
    };
  }

  // 収集は毎朝7:00。今日の実行前なら昨日のログが最新でも正常なので、
  // 「2日以上前が最新」を未実行とみなす。
  const gap = daysBetween(latest.date, today);
  if (gap >= 2) {
    return {
      state: "stale",
      message: `ニュース収集が${gap}日間実行されていません（最終実行 ${latest.date}）。PCの電源やタスクスケジューラを確認してください。`,
      lastSuccess,
      failingDays: 0,
    };
  }

  return { state: "ok", message: null, lastSuccess, failingDays: 0 };
}
