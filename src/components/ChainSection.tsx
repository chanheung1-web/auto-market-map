"use client";

import { useMemo, useState } from "react";
import { LAYER_LABELS, LAYER_ORDER, type Company, type Layer } from "@/lib/companies";
import type { PortfolioLink } from "@/lib/portfolio";
import { normalizeCode } from "@/lib/portfolio";
import { formatPercent } from "@/lib/regions";
import { SEGMENTS, segmentOf, type SegmentId } from "@/lib/segments";
import { SUPPLY_CATEGORIES, top3Share, type SupplyCategory } from "@/lib/supplyChain";
import type { Quote } from "@/lib/yahooFinance";

type Props = {
  companies: Company[];
  quotes: Map<string, Quote>;
  newsCountByCompany: Map<string, number>;
  portfolio: PortfolioLink | null;
  /** 画面から追加した銘柄の id。削除の意味が組み込みと違うので出し分ける。 */
  addedIds: Set<string>;
  layerFilter: Layer | "ALL";
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
  onRemoveCompany: (id: string) => void;
};

const SUPPLY_BY_ID = new Map(SUPPLY_CATEGORIES.map((c) => [c.id, c]));

function changeClass(v: number | null | undefined): string {
  if (v === null || v === undefined) return "text-zinc-500";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-zinc-300";
}

function formatPrice(q: Quote | undefined): string {
  if (!q || q.price === null) return "—";
  return q.price.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** 約定時刻。日付は必ず出す（AGENTS.md の「取得と約定は別の時刻」参照）。 */
function formatQuoteTime(ms: number | null | undefined): string | null {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return null;
  const d = new Date(ms);
  const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hhmm}`;
}

/** 寡占度の言い換え。数字だけでは高いか低いか判断できないため。 */
function concentration(top3: number | null): { text: string; tone: string } | null {
  if (top3 === null) return null;
  if (top3 >= 70) return { text: "寡占", tone: "border-red-700 bg-red-900/60 text-red-300" };
  if (top3 >= 45) return { text: "上位集中", tone: "border-amber-700 bg-amber-900/60 text-amber-300" };
  return { text: "分散", tone: "border-zinc-700 bg-zinc-800 text-zinc-300" };
}

function CompanyRow({
  company,
  quote,
  share,
  rank,
  newsCount,
  heldQty,
  watched,
  selected,
  removable,
  onSelect,
  onRemove,
}: {
  company: Company;
  quote: Quote | undefined;
  share: string | null;
  rank: number | null;
  newsCount: number;
  heldQty: number | undefined;
  watched: boolean;
  selected: boolean;
  /** true なら実体を削除（戻せない）、false なら非表示（戻せる）。 */
  removable: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const quoteTime = formatQuoteTime(quote?.quoteTime);
  return (
    <div
      className={`flex items-center gap-2 border-t border-zinc-800 ${
        selected ? "bg-sky-950/60" : "hover:bg-zinc-800/50"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left sm:px-3"
      >
        {/* シェア順位。Excel に載っている企業だけ付く。 */}
        <span className="w-5 shrink-0 text-center text-[11px] tabular-nums text-zinc-600">
          {rank ?? ""}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm text-zinc-100">{company.name}</span>
            {share && (
              <span className="shrink-0 rounded border border-sky-800 bg-sky-950/60 px-1 text-[10px] text-sky-300">
                シェア {share}
              </span>
            )}
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
            {company.country}
            {company.exchange ? ` · ${company.exchange}` : " · 非上場"} · {company.position}
          </div>
        </div>

        <div className="w-24 shrink-0 text-right sm:w-28" title={quote?.currency ?? undefined}>
          <div className="text-sm tabular-nums text-zinc-200">{formatPrice(quote)}</div>
          <div className={`text-xs tabular-nums ${changeClass(quote?.changePercent)}`}>
            {company.code === null ? "非上場" : formatPercent(quote?.changePercent ?? null)}
          </div>
          {quoteTime && <div className="text-[10px] tabular-nums text-zinc-600">{quoteTime}</div>}
        </div>
      </button>

      <button
        type="button"
        onClick={onRemove}
        title={
          removable
            ? "追加した銘柄を削除する（戻せません）"
            : "この銘柄を監視対象から外す（あとで戻せます）"
        }
        className="shrink-0 px-2 py-2 text-xs text-zinc-600 transition hover:text-red-400"
        aria-label={`${company.name} を監視対象から外す`}
      >
        ✕
      </button>
    </div>
  );
}

function SegmentCard({
  label,
  scope,
  supply,
  members,
  quotes,
  newsCountByCompany,
  portfolio,
  addedIds,
  selectedCompanyId,
  onSelectCompany,
  onRemoveCompany,
}: {
  label: string;
  scope: string;
  supply: SupplyCategory | null;
  members: Company[];
  quotes: Map<string, Quote>;
  newsCountByCompany: Map<string, number>;
  portfolio: PortfolioLink | null;
  addedIds: Set<string>;
  selectedCompanyId: string | null;
  onSelectCompany: (id: string | null) => void;
  onRemoveCompany: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const top3 = supply ? top3Share(supply) : null;
  const conc = concentration(top3);

  // Excel のシェアを企業に貼る。同じ企業が別カテゴリの上位に出ることもあるが、
  // ここではこのセグメントでの順位・シェアだけを見せる。
  const shareByCompany = useMemo(() => {
    const m = new Map<string, { share: string; rank: number }>();
    for (const p of supply?.players ?? []) {
      if (p.companyId) m.set(p.companyId, { share: p.share, rank: p.rank });
    }
    return m;
  }, [supply]);

  // シェア順位のある企業を先に、残りは騰落率順。非上場は最後。
  const sorted = useMemo(() => {
    return [...members].sort((a, b) => {
      const ra = shareByCompany.get(a.id)?.rank;
      const rb = shareByCompany.get(b.id)?.rank;
      if (ra !== undefined && rb !== undefined) return ra - rb;
      if (ra !== undefined) return -1;
      if (rb !== undefined) return 1;
      const va = a.code ? quotes.get(a.code)?.changePercent : undefined;
      const vb = b.code ? quotes.get(b.code)?.changePercent : undefined;
      if (typeof va === "number" && typeof vb === "number") return vb - va;
      if (typeof va === "number") return -1;
      if (typeof vb === "number") return 1;
      return a.name.localeCompare(b.name, "ja");
    });
  }, [members, shareByCompany, quotes]);

  // 監視していない上位プレイヤー。構造を理解するうえで抜けていると困るので、
  // 株価は無くても名前だけは出す。
  const unwatched = (supply?.players ?? []).filter(
    (p) => !p.companyId || !members.some((m) => m.id === p.companyId)
  );

  const avg = useMemo(() => {
    const v = members
      .map((c) => (c.code ? quotes.get(c.code)?.changePercent : undefined))
      .filter((x): x is number => typeof x === "number");
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  }, [members, quotes]);

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-2 p-3 text-left hover:bg-zinc-800/50"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <h4 className="text-sm font-semibold text-zinc-100">{label}</h4>
            <span className="text-[11px] text-zinc-500">{members.length}社</span>
            {conc && (
              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${conc.tone}`}>
                {conc.text} 上位3社 {top3!.toFixed(0)}%
              </span>
            )}
            {avg !== null && (
              <span className={`text-[11px] tabular-nums ${changeClass(avg)}`}>
                平均 {formatPercent(avg)}
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-zinc-500">{scope}</p>
          {supply && (
            <p className="mt-0.5 text-[11px] text-zinc-400">
              市場 <span className="text-zinc-200">{supply.marketSize}</span>
              {supply.cagr && (
                <>
                  {" ・ "}CAGR <span className="text-zinc-200">{supply.cagr}</span>
                </>
              )}
            </p>
          )}
        </div>
        <span className="shrink-0 text-zinc-500">{open ? "−" : "+"}</span>
      </button>

      {open && supply && (
        <div className="border-t border-zinc-800 px-3 py-2">
          <p className="text-sm leading-relaxed text-zinc-300">{supply.summary}</p>
          {supply.driver && (
            <p className="mt-1 text-[11px] text-zinc-500">
              <span className="text-zinc-600">ドライバー: </span>
              {supply.driver}
            </p>
          )}
        </div>
      )}

      <div>
        {sorted.map((c) => {
          const q = c.code ? quotes.get(c.code) : undefined;
          const key = c.code ? normalizeCode(c.code) : null;
          const s = shareByCompany.get(c.id);
          return (
            <CompanyRow
              key={c.id}
              company={c}
              quote={q}
              share={s?.share ?? null}
              rank={s?.rank ?? null}
              newsCount={newsCountByCompany.get(c.id) ?? 0}
              heldQty={key ? portfolio?.heldQuantityByCode[key] : undefined}
              watched={key ? (portfolio?.watchedCodes.includes(key) ?? false) : false}
              selected={selectedCompanyId === c.id}
              removable={addedIds.has(c.id)}
              onSelect={() => onSelectCompany(selectedCompanyId === c.id ? null : c.id)}
              onRemove={() => onRemoveCompany(c.id)}
            />
          );
        })}
      </div>

      {open && unwatched.length > 0 && (
        <div className="border-t border-zinc-800 px-3 py-2">
          <p className="mb-1 text-[11px] text-zinc-500">
            この分野の上位プレイヤーのうち、株価を追っていない企業
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unwatched.map((p) => (
              <span
                key={p.name}
                title={`${p.hq}｜${p.products}｜${p.strategy}`}
                className="rounded border border-zinc-800 bg-zinc-950/60 px-1.5 py-0.5 text-[11px] text-zinc-400"
              >
                {p.rank}. {p.name} {p.share}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function ChainSection({
  companies,
  quotes,
  newsCountByCompany,
  portfolio,
  addedIds,
  layerFilter,
  selectedCompanyId,
  onSelectCompany,
  onRemoveCompany,
}: Props) {
  // 階層 → セグメント → 企業 の1本の木にする。
  // セグメント未登録（画面から追加した銘柄）は各階層の末尾に「未分類」でまとめ、
  // 決して落とさない。
  const grouped = useMemo(() => {
    const byId = new Map<SegmentId, Company[]>();
    const unclassified = new Map<Layer, Company[]>();
    for (const c of companies) {
      const sid = segmentOf(c.id);
      if (sid) {
        if (!byId.has(sid)) byId.set(sid, []);
        byId.get(sid)!.push(c);
      } else {
        if (!unclassified.has(c.layer)) unclassified.set(c.layer, []);
        unclassified.get(c.layer)!.push(c);
      }
    }
    return { byId, unclassified };
  }, [companies]);

  const layers = layerFilter === "ALL" ? LAYER_ORDER : [layerFilter];

  return (
    <div className="space-y-6">
      {layers.map((layer) => {
        const segs = SEGMENTS.filter((s) => s.layer === layer);
        const extra = grouped.unclassified.get(layer) ?? [];
        const total =
          segs.reduce((n, s) => n + (grouped.byId.get(s.id)?.length ?? 0), 0) + extra.length;
        if (total === 0) return null;

        return (
          <div key={layer}>
            <h3 className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-zinc-200">
              {LAYER_LABELS[layer]}
              <span className="text-xs font-normal text-zinc-500">{total}社</span>
            </h3>

            <div className="space-y-2">
              {segs.map((s) => {
                const members = grouped.byId.get(s.id) ?? [];
                if (members.length === 0) return null;
                return (
                  <SegmentCard
                    key={s.id}
                    label={s.label}
                    scope={s.scope}
                    supply={s.supplyId ? (SUPPLY_BY_ID.get(s.supplyId) ?? null) : null}
                    members={members}
                    quotes={quotes}
                    newsCountByCompany={newsCountByCompany}
                    portfolio={portfolio}

                    addedIds={addedIds}
                    selectedCompanyId={selectedCompanyId}
                    onSelectCompany={onSelectCompany}
                    onRemoveCompany={onRemoveCompany}
                  />
                );
              })}

              {extra.length > 0 && (
                <SegmentCard
                  label="未分類"
                  scope="画面から追加した銘柄。セグメントは segments.ts で割り当てる"
                  supply={null}
                  members={extra}
                  quotes={quotes}
                  newsCountByCompany={newsCountByCompany}
                  portfolio={portfolio}

                  addedIds={addedIds}
                  selectedCompanyId={selectedCompanyId}
                  onSelectCompany={onSelectCompany}
                  onRemoveCompany={onRemoveCompany}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
