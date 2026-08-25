"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COMPANIES,
  LAYER_LABELS,
  LAYER_ORDER,
  type Layer,
  type Region,
} from "@/lib/companies";
import type { NewsItem } from "@/lib/news";
import { formatPercent, summarizeRegions } from "@/lib/regions";
import type { Quote } from "@/lib/yahooFinance";
import { NewsPanel } from "./NewsPanel";
import { RegionMap } from "./RegionMap";
import { ValueChainSection } from "./ValueChainSection";

const REFRESH_MS = 60_000;

export function Dashboard() {
  const [quotes, setQuotes] = useState<Map<string, Quote>>(new Map());
  const [news, setNews] = useState<NewsItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [layer, setLayer] = useState<Layer | "ALL">("ALL");
  const [region, setRegion] = useState<Region | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // setState を Promise のコールバック側に置いている。effect の同期実行中に
    // setState すると react-hooks/set-state-in-effect に弾かれるため
    // （GlobalMarketSummary in stock-trading-app と同じ形）。
    const load = () =>
      fetch("/api/quotes")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<{ quotes: Quote[]; fetchedAt: number }>;
        })
        .then((data) => {
          if (cancelled) return;
          setQuotes(new Map(data.quotes.map((q) => [q.symbol, q])));
          setFetchedAt(data.fetchedAt);
          setError(null);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : "株価の取得に失敗しました");
          setLoading(false);
        });

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // ニュースは隣フォルダのファイル読み取りなので、株価と違って市場中に動かない。
  // 初回だけ読む。
  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data: { news: NewsItem[] }) => setNews(data.news))
      .catch(() => setNews([]));
  }, []);

  const newsCountByCompany = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of news) {
      for (const id of n.companyIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [news]);

  const summaries = useMemo(
    () => summarizeRegions(COMPANIES, quotes, layer),
    [quotes, layer]
  );

  // 一覧は「地図で選んだ地域」と「階層タブ」の両方で絞る。銘柄の選択は
  // ニュース側のフィルタにだけ効かせ、一覧からは消さない（比較対象が消えると
  // 選び直すのに戻る操作が要るため）。
  const visibleCompanies = useMemo(
    () =>
      COMPANIES.filter(
        (c) => (layer === "ALL" || c.layer === layer) && (region === null || c.region === region)
      ),
    [layer, region]
  );

  const selectedCompany = companyId ? COMPANIES.find((c) => c.id === companyId) ?? null : null;

  // 全監視銘柄の平均。地域別の色が割れている日に「業界全体としてはどうだったのか」
  // を1つの数字で押さえるため。
  const overall = useMemo(() => {
    const changes = visibleCompanies
      .map((c) => (c.code ? quotes.get(c.code)?.changePercent : undefined))
      .filter((v): v is number => typeof v === "number");
    if (changes.length === 0) return null;
    return changes.reduce((a, b) => a + b, 0) / changes.length;
  }, [visibleCompanies, quotes]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-3 sm:p-6">
      <header className="space-y-1">
        <h1 className="text-lg font-bold text-zinc-100 sm:text-xl">
          自動車バリューチェーン・マーケットマップ
        </h1>
        <p className="text-xs text-zinc-500">
          完成車から素材まで {COMPANIES.length} 社の株価と、auto-industry-watcher が
          集めたニュースを1画面で見る
        </p>
        <p className="text-xs text-zinc-500">
          {loading
            ? "株価を取得中…"
            : fetchedAt
              ? `最終更新 ${new Date(fetchedAt).toLocaleTimeString("ja-JP")}（60秒ごと）`
              : ""}
          {error && <span className="ml-2 text-red-400">{error}</span>}
        </p>
      </header>

      {/* 階層フィルタ。地図の色もここで切り替わるので、「半導体だけ売られた日」の
          ような層特有の動きが地域別に見える。 */}
      <nav className="flex flex-wrap gap-1.5">
        {(["ALL", ...LAYER_ORDER] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLayer(l)}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              layer === l
                ? "border-sky-500 bg-sky-900/60 text-sky-100"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {l === "ALL" ? "全階層" : LAYER_LABELS[l]}
          </button>
        ))}
      </nav>

      <section className="space-y-2">
        <RegionMap summaries={summaries} selected={region} onSelect={setRegion} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
          <span>
            表示中の平均:{" "}
            <span className="tabular-nums text-zinc-200">{formatPercent(overall)}</span>
          </span>
          <span>
            対象 {visibleCompanies.length} 社
            {region && `（${region}のみ）`}
            {layer !== "ALL" && `（${LAYER_LABELS[layer]}のみ）`}
          </span>
          {region && (
            <button
              type="button"
              onClick={() => setRegion(null)}
              className="text-sky-400 hover:underline"
            >
              地域の絞り込みを解除
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-zinc-100">バリューチェーン</h2>
        <ValueChainSection
          companies={visibleCompanies}
          quotes={quotes}
          newsCountByCompany={newsCountByCompany}
          selectedCompanyId={companyId}
          onSelectCompany={setCompanyId}
        />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-zinc-100">
          ニュース
          {selectedCompany && (
            <button
              type="button"
              onClick={() => setCompanyId(null)}
              className="text-xs font-normal text-sky-400 hover:underline"
            >
              {selectedCompany.name} の絞り込みを解除
            </button>
          )}
        </h2>
        <NewsPanel
          news={news}
          filterCompanyId={companyId}
          filterCompanyName={selectedCompany?.name ?? null}
        />
      </section>

      <footer className="border-t border-zinc-800 pt-3 text-xs text-zinc-600">
        株価は Yahoo Finance の非公式エンドポイントによる参考値で、遅延・欠損があります。
        情報整理を目的としたもので、投資助言ではありません。
      </footer>
    </main>
  );
}
