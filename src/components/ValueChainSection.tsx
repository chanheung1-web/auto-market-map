"use client";

import { LAYER_LABELS, LAYER_ORDER, type Company, type Layer } from "@/lib/companies";
import type { PortfolioLink } from "@/lib/portfolio";
import { normalizeCode } from "@/lib/portfolio";
import { formatPercent } from "@/lib/regions";
import type { Quote } from "@/lib/yahooFinance";

type Props = {
  companies: Company[];
  quotes: Map<string, Quote>;
  newsCountByCompany: Map<string, number>;
  portfolio: PortfolioLink | null;
  addedIds: Set<string>;
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
  onRemoveCompany: (id: string) => void;
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
  portfolio,
  addedIds,
  selectedCompanyId,
  onSelectCompany,
  onRemoveCompany,
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

                const key = c.code ? normalizeCode(c.code) : null;
                const heldQty = key ? portfolio?.heldQuantityByCode[key] : undefined;
                const watched = key ? portfolio?.watchedCodes.includes(key) : false;

                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2 ${
                      i > 0 ? "border-t border-zinc-800" : ""
                    } ${isSelected ? "bg-sky-950/60" : "hover:bg-zinc-800/50"}`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectCompany(isSelected ? null : c.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left sm:px-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm text-zinc-100">{c.name}</span>
                          {heldQty !== undefined && (
                            <span className="shrink-0 rounded bg-amber-900/70 px-1 text-[10px] text-amber-200">
                              保有 {heldQty}
                            </span>
                          )}
                          {watched && heldQty === undefined && (
                            <span className="shrink-0 rounded bg-sky-900/70 px-1 text-[10px] text-sky-200">
                              ウォッチ
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

                      {/* 幅を固定しないと、バッジの有無で価格列の位置が行ごとにずれて
                          縦に読めなくなる。数字は右揃えで列として成立させる。 */}
                      <div
                        className="w-24 shrink-0 text-right sm:w-28"
                        title={q?.currency ?? undefined}
                      >
                        <div className="text-sm tabular-nums text-zinc-200">{formatPrice(q)}</div>
                        <div className={`text-xs tabular-nums ${changeClass(q?.changePercent)}`}>
                          {c.code === null ? "非上場" : formatPercent(q?.changePercent ?? null)}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveCompany(c.id)}
                      title={
                        addedIds.has(c.id)
                          ? "追加した銘柄を削除する"
                          : "この銘柄を監視対象から外す（あとで戻せます）"
                      }
                      className="shrink-0 px-2 py-2 text-xs text-zinc-600 transition hover:text-red-400"
                      aria-label={`${c.name} を監視対象から外す`}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
