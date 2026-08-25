"use client";

import type { Region } from "@/lib/companies";
import { REGION_POSITION, formatPercent, toneFor, type RegionSummary } from "@/lib/regions";
import { WorldMapSilhouette } from "./WorldMapSilhouette";

type Props = {
  summaries: RegionSummary[];
  selected: Region | null;
  onSelect: (region: Region | null) => void;
};

export function RegionMap({ summaries, selected, onSelect }: Props) {
  return (
    // 狭い画面では縦長にする。バッジを縦に離す余地がないと東アジアが団子になる。
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 sm:aspect-[2/1]">
      <WorldMapSilhouette />

      {summaries.map((s) => {
        const isSelected = selected === s.region;
        return (
          <button
            key={s.region}
            type="button"
            onClick={() => onSelect(isSelected ? null : s.region)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-1.5 py-1 text-center leading-tight shadow-lg transition ${
              REGION_POSITION[s.region]
            } ${toneFor(s.avgChangePercent)} ${
              isSelected ? "ring-2 ring-sky-400" : "hover:brightness-125"
            }`}
            aria-pressed={isSelected}
          >
            <div className="text-[10px] font-medium sm:text-xs">{s.region}</div>
            <div className="text-[11px] font-bold tabular-nums sm:text-sm">
              {formatPercent(s.avgChangePercent)}
            </div>
            {/* 平均だけでは「全体が少し上げた」と「半分が急騰し半分が急落した」が
                同じ色になるため、内訳を小さく添える。 */}
            <div className="text-[9px] opacity-80 tabular-nums sm:text-[10px]">
              {s.advancers}↑ {s.decliners}↓
            </div>
          </button>
        );
      })}

      <p className="absolute bottom-1 left-2 text-[9px] text-zinc-500 sm:text-[10px]">
        地域内の監視銘柄の騰落率の単純平均（指数ではありません）
      </p>
    </div>
  );
}
