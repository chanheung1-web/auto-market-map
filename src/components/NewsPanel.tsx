"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/news";
import { tagColor } from "@/lib/tags";

type Props = {
  news: NewsItem[];
  /** 収集対象にしている日数。空状態の説明に使う。 */
  recentDays: number;
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

export function NewsPanel({ news, recentDays, filterCompanyId, filterCompanyName }: Props) {
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
          : `${shown.length}件`}
        （auto-industry-watcher が収集した直近{recentDays}日ぶん）
      </p>

      {shown.length === 0 && (
        <div className="space-y-1 rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">
          <p>直近{recentDays}日にこの企業へ紐づくニュースはありません。</p>
          {/* 「この一覧に足せば収集され始める」と誤解されやすいので明記する。
              収集対象を決めているのは別プロジェクトで、こちらのリストではない。 */}
          <p className="text-xs text-zinc-500">
            ニュースを集めているのは隣の auto-industry-watcher で、収集対象は
            あちらの <code>data/companies.json</code> で決まります。この画面に銘柄を
            追加しても収集範囲は変わらず、すでに集まっているニュースとの
            突き合わせだけが行われます。
          </p>
        </div>
      )}

      {shown.map((n) => {
        const isOpen = expanded === n.id;
        return (
          <article key={n.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
            <div className="p-3">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                {/* 分類を先頭に置く。一覧をざっと流すとき、色の並びだけで
                    「今日は規制の話が多い」といった偏りが見える。 */}
                {n.tags.map((t) => (
                  <span
                    key={t}
                    className={`rounded border px-1.5 py-0.5 text-[10px] ${tagColor(t)}`}
                  >
                    {t}
                  </span>
                ))}
                <span className={`rounded px-1 text-[10px] ${confidenceClass(n.confidence)}`}>
                  {n.confidence}
                </span>
                {n.follow_up_to && (
                  <span className="rounded bg-sky-900/70 px-1 text-[10px] text-sky-200">続報</span>
                )}
              </div>

              {/* 見出しそのものを出典へのリンクにする。読むか決めた次の動作は
                  ほぼ必ず「原文を開く」なので、開閉と別に一手を挟ませない。 */}
              <a
                href={n.primary_source}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-zinc-100 hover:text-sky-400 hover:underline"
              >
                {n.headline}
              </a>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500">
                <span className="tabular-nums">{n.date}</span>
                <span>{hostOf(n.primary_source)}</span>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : n.id)}
                  className="text-sky-400 hover:underline"
                >
                  {isOpen ? "閉じる" : "要約と論点"}
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="space-y-2 border-t border-zinc-800 px-3 py-2 text-sm">
                <p className="text-zinc-300">{n.summary}</p>
                <p className="text-zinc-400">
                  <span className="text-zinc-500">論点: </span>
                  {n.impact}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a
                    href={n.primary_source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-400 hover:underline"
                  >
                    出典: {hostOf(n.primary_source)}
                  </a>
                  {/* 重複排除で束ねた他媒体。裏を取りたいときに要る。 */}
                  {(n.related_urls ?? []).map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-sky-400 hover:underline"
                    >
                      関連: {hostOf(url)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
