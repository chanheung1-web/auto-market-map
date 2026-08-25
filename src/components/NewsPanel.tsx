"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/news";

type Props = {
  news: NewsItem[];
  /** 銘柄を選んでいるときは、その企業に紐づくニュースだけに絞る。 */
  filterCompanyId: string | null;
  filterCompanyName: string | null;
};

function confidenceClass(confidence: string): string {
  if (confidence === "確定") return "bg-emerald-900/70 text-emerald-200";
  if (confidence === "推定") return "bg-amber-900/70 text-amber-200";
  return "bg-red-900/70 text-red-200";
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function NewsPanel({ news, filterCompanyId, filterCompanyName }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const shown = filterCompanyId
    ? news.filter((n) => n.companyIds.includes(filterCompanyId))
    : news;

  if (news.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">
        ニュースを読み込めませんでした。隣の <code>auto-industry-watcher</code> の
        <code> data/news/</code> がまだ空か、フォルダ構成が変わった可能性があります。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">
        {filterCompanyName
          ? `${filterCompanyName} に紐づくニュース ${shown.length}件`
          : `直近 ${shown.length}件`}
        （auto-industry-watcher の収集分）
      </p>

      {shown.length === 0 && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">
          この企業に紐づく収集済みニュースはありません。監視対象の tier によっては
          そもそも個別に収集されていないことがあります。
        </p>
      )}

      {shown.map((n) => {
        const isOpen = expanded === n.id;
        return (
          <article key={n.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : n.id)}
              className="flex w-full items-start gap-2 p-3 text-left hover:bg-zinc-800/50"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs tabular-nums text-zinc-400">{n.date}</span>
                  <span className={`rounded px-1 text-[10px] ${confidenceClass(n.confidence)}`}>
                    {n.confidence}
                  </span>
                  {n.tags.map((t) => (
                    <span key={t} className="rounded bg-zinc-800 px-1 text-[10px] text-zinc-300">
                      {t}
                    </span>
                  ))}
                  {n.follow_up_to && (
                    <span className="rounded bg-sky-900/70 px-1 text-[10px] text-sky-200">続報</span>
                  )}
                </div>
                <h4 className="text-sm text-zinc-100">{n.headline}</h4>
              </div>
              <span className="shrink-0 text-zinc-500">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className="space-y-2 border-t border-zinc-800 px-3 py-2 text-sm">
                <p className="text-zinc-300">{n.summary}</p>
                <p className="text-zinc-400">
                  <span className="text-zinc-500">論点: </span>
                  {n.impact}
                </p>
                <a
                  href={n.primary_source}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-xs text-sky-400 hover:underline"
                >
                  出典: {hostOf(n.primary_source)}
                </a>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
