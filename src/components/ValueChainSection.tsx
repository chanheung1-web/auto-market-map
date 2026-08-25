"use client";

import { LAYER_LABELS, LAYER_ORDER, type Company, type Layer } from "@/lib/companies";
import { formatPercent } from "@/lib/regions";
import type { Quote } from "@/lib/yahooFinance";

type Props = {
  companies: Company[];
  quotes: Map<string, Quote>;
  newsCountByCompany: Map<string, number>;
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
};

function changeClass(v: number | null | undefined): string {
  if (v === null || v === undefined) return "text-zinc-500";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-zinc-300";
}

function formatPrice(q: Quote | undefined): string {
  if (!q || q.price === null) return "—";
  // 通貨単位はまちまち（円・ドル・ユーロ・ウォン）なので、桁を揃えるより
  // 通貨記号を出さずに数値だけ見せ、currency はツールチップに回す。
  return q.price.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function ValueChainSection({
  companies,
  quotes,
  newsCountByCompany,
  selectedCompanyId,
  onSelectCompany,
}: Props) {
  return (
    <div className="space-y-6">
      {LAYER_ORDER.map((layer: Layer) => {
        const members = companies.filter((c) => c.layer === layer);
        if (members.length === 0) return null;

        // 各階層の中では騰落率の高い順に並べる。取得できなかった銘柄と非上場は
        // 最後にまとめる（毎回同じ位置にいてほしいので企業名順で固定）。
        const sorted = [...members].sort((a, b) => {
          const av = a.code ? quotes.get(a.code)?.changePercent : undefined;
          const bv = b.code ? quotes.get(b.code)?.changePercent : undefined;
          if (typeof av === "number" && typeof bv === "number") return bv - av;
          if (typeof av === "number") return -1;
          if (typeof bv === "number") return 1;
          return a.name.localeCompare(b.name, "ja");
        });

        return (
          <section key={layer}>
            <h3 className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-zinc-200">
              {LAYER_LABELS[layer]}
              <span className="text-xs font-normal text-zinc-500">{members.length}社</span>
            </h3>

            <div className="overflow-hidden rounded-lg border border-zinc-800">
              {sorted.map((c, i) => {
                const q = c.code ? quotes.get(c.code) : undefined;
                const newsCount = newsCountByCompany.get(c.id) ?? 0;
                const isSelected = selectedCompanyId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCompany(isSelected ? null : c.id)}
                    className={`flex w-full items-center gap-2 px-2 py-2 text-left transition sm:px-3 ${
                      i > 0 ? "border-t border-zinc-800" : ""
                    } ${isSelected ? "bg-sky-950/60" : "hover:bg-zinc-800/50"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm text-zinc-100">{c.name}</span>
                        {c.held && (
                          <span className="shrink-0 rounded bg-amber-900/70 px-1 text-[10px] text-amber-200">
                            保有
                          </span>
                        )}
                        {newsCount > 0 && (
                          <span className="shrink-0 rounded bg-zinc-700 px-1 text-[10px] text-zinc-200">
                            news {newsCount}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-zinc-500">
                        {c.country}
                        {c.exchange ? ` · ${c.exchange}` : " · 非上場"} · {c.position}
                      </div>
                    </div>

                    <div className="shrink-0 text-right" title={q?.currency ?? undefined}>
                      <div className="text-sm tabular-nums text-zinc-200">{formatPrice(q)}</div>
                      <div className={`text-xs tabular-nums ${changeClass(q?.changePercent)}`}>
                        {c.code === null ? "非上場" : formatPercent(q?.changePercent ?? null)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
