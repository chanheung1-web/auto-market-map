"use client";

import { useEffect, useRef, useState } from "react";
import { LAYER_LABELS, LAYER_ORDER, type Company } from "@/lib/companies";
import { REGION_ORDER } from "@/lib/regions";

type HiddenCompany = { id: string; name: string };

type Props = {
  onAdded: (companies: Company[], addedIds: string[], hidden: HiddenCompany[]) => void;
};

type SearchResult = { symbol: string; name: string; exchange: string; type: string };

/**
 * 検索欄への入力が止まってから投げるまでの待ち時間。
 *
 * 1文字ごとに Yahoo を叩くと、日本語入力の変換中（「とうかい」→「東海理化」）に
 * 意味のないクエリが何本も飛ぶ。
 */
const DEBOUNCE_MS = 300;

export function AddCompanyForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  /** 検索結果から選んだ銘柄。これが決まるまで追加はできない。 */
  const [picked, setPicked] = useState<SearchResult | null>(null);

  const [layer, setLayer] = useState<string>(LAYER_ORDER[0]);
  const [region, setRegion] = useState<string>("日本");
  const [position, setPosition] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 打ち終わってから検索する。応答が前後して古い結果が残らないよう、
  // 実行中のクエリを覚えておいて一致するときだけ反映する。
  //
  // `searching` は入力ハンドラ側で立てる。effect の同期実行中に setState すると
  // react-hooks/set-state-in-effect に弾かれるため、ここでは setState を
  // fetch のコールバックの中だけに置く。
  const latestQuery = useRef("");
  useEffect(() => {
    const q = query.trim();
    latestQuery.current = q;

    if (q.length === 0 || picked) return;

    const timer = setTimeout(() => {
      fetch(`/api/symbol-search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data: { results?: SearchResult[] }) => {
          if (latestQuery.current !== q) return;
          setResults(data.results ?? []);
          setSearching(false);
        })
        .catch(() => {
          if (latestQuery.current !== q) return;
          setResults([]);
          setSearching(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, picked]);

  const reset = () => {
    setQuery("");
    setResults([]);
    setPicked(null);
    setPosition("");
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked) {
      setError("検索結果から銘柄を選んでください");
      return;
    }
    setBusy(true);
    setError(null);

    fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: picked.name,
        code: picked.symbol,
        exchange: picked.exchange,
        layer,
        region,
        position,
      }),
    })
      .then((res) => res.json())
      .then(
        (data: {
          ok: boolean;
          error?: string;
          companies?: Company[];
          addedIds?: string[];
          hidden?: HiddenCompany[];
        }) => {
          if (!data.ok) {
            setError(data.error ?? "追加できませんでした");
            return;
          }
          onAdded(data.companies ?? [], data.addedIds ?? [], data.hidden ?? []);
          reset();
          setOpen(false);
        }
      )
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "追加できませんでした");
      })
      .finally(() => setBusy(false));
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800"
      >
        ＋ 銘柄を追加
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="w-full space-y-2 rounded-lg border border-zinc-700 bg-zinc-900 p-3">
      <div className="relative">
        <span className="mb-0.5 block text-[11px] text-zinc-400">
          銘柄を検索（社名・証券コードどちらでも）
        </span>

        {picked ? (
          <div className="flex items-center gap-2 rounded border border-sky-700 bg-sky-950/50 px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-zinc-100">{picked.name}</div>
              <div className="truncate text-[11px] text-zinc-400">
                {picked.symbol}
                {picked.exchange && ` · ${picked.exchange}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPicked(null);
                setQuery("");
              }}
              className="shrink-0 text-xs text-sky-300 hover:underline"
            >
              選び直す
            </button>
          </div>
        ) : (
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // 入力した瞬間に「検索中…」を出す。デバウンス待ちのあいだ
              // 前回の結果が残っていると、打ち替えたのに古い候補が出ているように見える。
              setSearching(e.target.value.trim().length > 0);
              setResults([]);
            }}
            placeholder="例: 東海理化 / 6995 / Aptiv"
            autoFocus
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-base text-zinc-100 outline-none focus:border-sky-500 sm:text-sm"
          />
        )}

        {!picked && query.trim().length > 0 && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
            {searching && <div className="px-3 py-2 text-sm text-zinc-500">検索中…</div>}
            {!searching &&
              results.map((r) => (
                <button
                  key={r.symbol}
                  type="button"
                  onClick={() => {
                    setPicked(r);
                    setResults([]);
                  }}
                  className="flex w-full items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2 text-left last:border-b-0 hover:bg-zinc-800"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{r.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {r.symbol}
                    {r.exchange && `（${r.exchange}）`}
                  </span>
                </button>
              ))}
            {!searching && results.length === 0 && (
              <div className="px-3 py-2 text-sm text-zinc-500">該当なし</div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-0.5 block text-[11px] text-zinc-400">階層</span>
          <select
            value={layer}
            onChange={(e) => setLayer(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-base text-zinc-100 outline-none focus:border-sky-500 sm:text-sm"
          >
            {LAYER_ORDER.map((l) => (
              <option key={l} value={l}>
                {LAYER_LABELS[l]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-0.5 block text-[11px] text-zinc-400">地域</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-base text-zinc-100 outline-none focus:border-sky-500 sm:text-sm"
          >
            {REGION_ORDER.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-0.5 block text-[11px] text-zinc-400">ひとこと説明（任意）</span>
        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="例: スイッチ・シフト・スマートキー"
          className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-base text-zinc-100 outline-none focus:border-sky-500 sm:text-sm"
        />
      </label>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={busy || !picked}
          className="rounded border border-sky-600 bg-sky-900/60 px-3 py-1.5 text-xs text-sky-100 transition hover:bg-sky-800/60 disabled:opacity-40"
        >
          {busy ? "確認中…" : "追加"}
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-xs text-zinc-400 hover:underline"
        >
          やめる
        </button>
      </div>
    </form>
  );
}
