// auto-industry-watcher の auto-news-collector が付ける分類タグ。
// 色は stock-trading-app のニュース分類（NEWS_CATEGORY_COLOR）と同じ組み方に
// 揃えてある — 2つのアプリを行き来しても色の意味がぶれないように。
//
// 近い意味のタグに近い色を割り当てている（EV/電池と自動運転はどちらも
// 「技術の転換」側なので緑系と紫系、規制と品質はどちらも「外から来る制約」なので
// 赤・橙系）。並べたときに塊が見えることを狙っている。
export const TAG_COLOR: Record<string, string> = {
  "EV/電池": "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  "自動運転/SDV": "bg-purple-900/60 text-purple-300 border-purple-700",
  規制: "bg-rose-900/60 text-rose-300 border-rose-700",
  "リコール・品質": "bg-orange-900/60 text-orange-300 border-orange-700",
  "提携・M&A": "bg-indigo-900/60 text-indigo-300 border-indigo-700",
  販売実績: "bg-blue-900/60 text-blue-300 border-blue-700",
  サプライチェーン: "bg-amber-900/60 text-amber-300 border-amber-700",
  決算: "bg-cyan-900/60 text-cyan-300 border-cyan-700",
  "人事・組織": "bg-teal-900/60 text-teal-300 border-teal-700",
  その他: "bg-zinc-800 text-zinc-300 border-zinc-700",
};

/** 未知のタグが来ても色が付くようにする（収集側でタグが増えても壊れない）。 */
export function tagColor(tag: string): string {
  return TAG_COLOR[tag] ?? "bg-zinc-800 text-zinc-300 border-zinc-700";
}
