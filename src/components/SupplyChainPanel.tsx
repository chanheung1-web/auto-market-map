"use client";

import { useState } from "react";
import { LAYER_LABELS, type Company, type Layer } from "@/lib/companies";
import { formatPercent } from "@/lib/regions";
import { SUPPLY_CATEGORIES, top3Share, type SupplyCategory } from "@/lib/supplyChain";
import type { Quote } from "@/lib/yahooFinance";

type Props = {
  /** 階層タブ。バリューチェーン一覧と同じ絞り込みを効かせる。 */
  layer: Layer | "ALL";
  companies: Company[];
  quotes: Map<string, Quote>;
  onSelectCompany: (id: string) => void;
};

function changeClass(v: number | null | undefined): string {
  if (v === null || v === undefined) return "text-zinc-500";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-zinc-300";
}

/** 寡占度の言い換え。数字だけだと「高いのか低いのか」が判断できないため。 */
function concentrationLabel(top3: number | null): { text: string; tone: string } | null {
  if (top3 === null) return null;
  if (top3 >= 70) return { text: "寡占", tone: "bg-red-900/60 text-red-300 border-red-700" };
  if (top3 >= 45) return { text: "上位集中", tone: "bg-amber-900/60 text-amber-300 border-amber-700" };
  return { text: "分散", tone: "bg-zinc-800 text-zinc-300 border-zinc-700" };
}

function CategoryCard({
  cat,
  companies,
  quotes,
  onSelectCompany,
}: {
  cat: SupplyCategory;
  companies: Company[];
  quotes: Map<string, Quote>;
  onSelectCompany: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const top3 = top3Share(cat);
  const conc = concentrationLabel(top3);
  const linked = cat.players.filter((p) => p.companyId).length;

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-2 p-3 text-left hover:bg-zinc-800/50"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
              {LAYER_LABELS[cat.layer]}
            </span>
            {conc && (
              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${conc.tone}`}>
                {conc.text} 上位3社 {top3!.toFixed(0)}%
              </span>
            )}
            {linked > 0 && (
              <span className="rounded bg-zinc-700 px-1 text-[10px] text-zinc-200">
                株価 {linked}/5
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-zinc-100">{cat.title}</h3>
          <p className="truncate text-[11px] text-zinc-500">{cat.subtitle}</p>
          <p className="mt-1 text-[11px] text-zinc-400">
            市場 <span className="text-zinc-200">{cat.marketSize}</span>
            {cat.cagr && (
              <>
                {" ・ "}CAGR <span className="text-zinc-200">{cat.cagr}</span>
              </>
            )}
          </p>
        </div>
        <span className="shrink-0 text-zinc-500">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-zinc-800 px-3 py-3">
          <p className="text-sm leading-relaxed text-zinc-300">{cat.summary}</p>
          {cat.driver && (
            <p className="text-[11px] text-zinc-500">
              <span className="text-zinc-600">ドライバー: </span>
              {cat.driver}
            </p>
          )}

          <div className="space-y-1.5">
            {cat.players.map((p) => {
              const co = p.companyId ? companies.find((c) => c.id === p.companyId) : undefined;
              const q = co?.code ? quotes.get(co.code) : undefined;
              return (
                <div key={p.rank} className="rounded border border-zinc-800 bg-zinc-950/60 p-2">
                  <div className="flex items-start gap-2">
                    <span className="w-6 shrink-0 text-center text-xs tabular-nums text-zinc-500">
                      {p.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {/* 監視銘柄に紐づく企業だけ押せる。押すとニュースが絞られる。 */}
                        {co ? (
                          <button
                            type="button"
                            onClick={() => onSelectCompany(co.id)}
                            className="text-sm text-sky-300 hover:underline"
                          >
                            {p.name}
                          </button>
                        ) : (
                          <span className="text-sm text-zinc-200">{p.name}</span>
                        )}
                        <span className="text-[11px] text-zinc-500">{p.hq}</span>
                      </div>

                      {/* シェアの棒。カテゴリ内の相対比較なので軸は 40% で固定せず
                          最大値基準にすると、寡占カテゴリと分散カテゴリの見え方が
                          同じになってしまう。絶対値で描く。 */}
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800 sm:w-32">
                          <div
                            className="h-full rounded-full bg-sky-600"
                            style={{ width: `${Math.min(100, (p.sharePercent ?? 0) * 2)}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-zinc-300">{p.share}</span>
                        <span className="text-[11px] text-zinc-500">{p.shareNote}</span>
                        {q && (
                          <span className={`text-xs tabular-nums ${changeClass(q.changePercent)}`}>
                            {formatPercent(q.changePercent)}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-zinc-400">{p.products}</p>
                      <p className="text-[11px] text-zinc-500">{p.strategy}</p>
                      {p.note && <p className="text-[11px] text-zinc-600">{p.note}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

export function SupplyChainPanel({ layer, companies, quotes, onSelectCompany }: Props) {
  const shown =
    layer === "ALL" ? SUPPLY_CATEGORIES : SUPPLY_CATEGORIES.filter((c) => c.layer === layer);

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">
        部品カテゴリ {shown.length} 件。市場規模とシェアは2024年基準の調査会社推計（±数%）で、
        <span className="text-zinc-400">調査会社ごとに市場の定義が違うため合計しないこと</span>。
        企業名が青いものは監視銘柄に紐づいており、押すとニュースが絞り込まれます。
      </p>

      {shown.length === 0 && (
        <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-400">
          この階層に対応する部品カテゴリはありません。
          元データ（2024年基準）には電池・完成車のカテゴリが含まれていないためです。
        </p>
      )}

      {shown.map((c) => (
        <CategoryCard
          key={c.id}
          cat={c}
          companies={companies}
          quotes={quotes}
          onSelectCompany={onSelectCompany}
        />
      ))}
    </div>
  );
}
