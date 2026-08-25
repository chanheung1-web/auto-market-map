"use client";

import { useState } from "react";
import type { TopicReport } from "@/lib/topics";

type Props = { weekly: TopicReport[]; daily: TopicReport[] };

/**
 * ごく軽い Markdown 描画。
 *
 * レポートは auto-digest-writer が決まったテンプレートで書いているので、
 * 出てくる記法は見出し・箇条書き・表・強調に限られる。この範囲なら
 * ライブラリを足すより、必要なぶんだけ自前で処理したほうが依存が増えない。
 */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * 素のURLをリンクにする。
 *
 * レポートは `（出典：https://... ／ 確度：確定）` の形で出典を本文に埋め込む。
 * Markdown のリンク記法ではないので、そのままでは押せないただの文字列になる。
 *
 * 末尾の句読点・閉じ括弧はURLに含めない。日本語の文中に置かれると
 * `https://example.com/a）` のように全角括弧がくっついて、リンク先が壊れる。
 */
const URL_PATTERN = /(https?:\/\/[^\s<>「」（）()｜|、。]+)/g;

function linkify(text: string, keyPrefix: string) {
  return text.split(URL_PATTERN).map((part, i) => {
    if (!/^https?:\/\//.test(part)) return <span key={`${keyPrefix}-u${i}`}>{part}</span>;
    return (
      <a
        key={`${keyPrefix}-u${i}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-sky-400 hover:underline"
        title={part}
      >
        {hostOf(part)}
      </a>
    );
  });
}

function renderInline(text: string, keyPrefix: string) {
  // **強調** だけ拾う。テンプレート上、論点の核はここに入る。
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{linkify(part, `${keyPrefix}-${i}`)}</span>;
  });
}

function Markdown({ source }: { source: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h4 key={i} className="mt-3 mb-1 text-sm font-semibold text-sky-300">
          {trimmed.slice(3)}
        </h4>
      );
      continue;
    }

    // 表はそのまま出すと崩れるので、区切り行を落として1行ずつ並べる。
    // 週次の「各社の動き」表がこれに当たる。
    if (trimmed.startsWith("|")) {
      if (/^\|[\s|:-]+\|$/.test(trimmed)) continue;
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
        .filter(Boolean);
      blocks.push(
        <div key={i} className="border-l-2 border-zinc-700 py-0.5 pl-2 text-xs text-zinc-400">
          {cells.map((c, ci) => (
            <span key={ci}>
              {ci > 0 && <span className="text-zinc-600"> / </span>}
              <span className={ci === 0 ? "font-medium text-zinc-200" : undefined}>
                {renderInline(c, `${i}-${ci}`)}
              </span>
            </span>
          ))}
        </div>
      );
      continue;
    }

    const numbered = /^(\d+)\.\s+(.*)$/.exec(trimmed);
    if (numbered) {
      blocks.push(
        <p key={i} className="mt-2 text-sm leading-relaxed text-zinc-300">
          <span className="mr-1 font-bold text-sky-400">{numbered[1]}.</span>
          {renderInline(numbered[2], String(i))}
        </p>
      );
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push(
        <p key={i} className="ml-3 text-sm leading-relaxed text-zinc-300">
          ・{renderInline(trimmed.slice(2), String(i))}
        </p>
      );
      continue;
    }

    blocks.push(
      <p key={i} className="text-sm leading-relaxed text-zinc-300">
        {renderInline(trimmed, String(i))}
      </p>
    );
  }

  return <div className="space-y-1">{blocks}</div>;
}

export function TopicsPanel({ weekly, daily }: Props) {
  const [tab, setTab] = useState<"weekly" | "daily">("weekly");
  // 最新の1本だけ開いた状態で始める。ここに来る目的は「最新の論点を読む」ことで、
  // 過去分は必要になってから開けばよい。
  const list = tab === "weekly" ? weekly : daily;
  const [openId, setOpenId] = useState<string | null>(null);
  const effectiveOpenId = openId ?? list[0]?.id ?? null;

  if (weekly.length === 0 && daily.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">
        ダイジェストを読み込めませんでした。
        <code> ../auto-industry-watcher/reports/ </code>
        がまだ空か、フォルダ構成が変わった可能性があります。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {(["weekly", "daily"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setTab(k);
              setOpenId(null);
            }}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              tab === k
                ? "border-sky-500 bg-sky-900/60 text-sky-100"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {k === "weekly" ? `Weekly（${weekly.length}）` : `Daily（${daily.length}）`}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">
          このレポートはまだありません。
        </p>
      )}

      {list.map((t) => {
        const isOpen = effectiveOpenId === t.id;
        return (
          <article key={t.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? "" : t.id)}
              className="flex w-full items-start gap-2 p-3 text-left hover:bg-zinc-800/50"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[11px] tabular-nums text-zinc-500">{t.id}</div>
                <h3 className="text-sm font-medium text-zinc-100">{t.title}</h3>
              </div>
              <span className="shrink-0 text-zinc-500">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className="border-t border-zinc-800 px-3 py-2">
                <Markdown source={t.body} />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
