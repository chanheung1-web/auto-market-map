import { COMPANIES } from "./companies";

// このファイルはクライアントからも読まれる（型と定数を共有するため）ので、
// node:fs などサーバー専用のモジュールを import してはいけない。
// 実ファイルの読み取りは news.server.ts 側にある。

/** auto-industry-watcher の auto-news-collector が書くレコード。 */
export type NewsRecord = {
  id: string;
  date: string;
  company: string[];
  tickers: string[];
  tags: string[];
  headline: string;
  summary: string;
  impact: string;
  primary_source: string;
  related_urls?: string[];
  confidence: string;
  follow_up_to: string | null;
  collected_at: string;
};

/** UI に渡す形。どの監視対象企業に紐づくかを解決済みにしてある。 */
export type NewsItem = NewsRecord & { companyIds: string[] };

/**
 * 何日前までを「今の話」として扱うか。
 *
 * これより古い記事は読み込み時点で捨てる。銘柄カードの `news N` バッジは
 * 「この企業に今何か起きている」の合図なので、2か月前の記事で点灯しても
 * 意味がない（むしろ最近動きのある企業を見分けられなくなる）。
 * 古い記事を遡って読みたい場合は auto-industry-watcher の JSONL を直接見る。
 */
export const RECENT_DAYS = 60;

// ニュース側の tickers は "7203" のような素の証券コードだが、こちらの code は
// Yahoo シンボル "7203.T" なので、そのままでは突き合わせられない。
const BY_TICKER_PREFIX = new Map<string, string>();
const BY_NAME = new Map<string, string>();
for (const c of COMPANIES) {
  if (c.code) BY_TICKER_PREFIX.set(c.code.split(".")[0], c.id);
  BY_NAME.set(c.name, c.id);
}

// auto-industry-watcher 側の表記とこちら側の表記が食い違う分だけを手当てする。
// （あちらは正式社名、こちらは通称を使っている箇所がある）
const NAME_ALIASES: Record<string, string> = {
  ホンダ: "honda",
  本田技研工業: "honda",
  三菱自動車工業: "mitsubishi-motors",
  "BYD Company": "byd",
  日立: "hitachi",
  日立製作所: "hitachi",
  ソニー: "sony",
  トーヨータイヤ: "toyo-tire",
  日本特殊陶業: "niterra",
  // 海外勢は収集側が日本語のカタカナ表記で書くため、ticker が付いていない
  // レコードは名前でしか拾えない。実際に取りこぼしていたぶんを追加した。
  ヒョンデ: "hyundai",
  現代自: "hyundai",
  ステランティス: "stellantis",
  フォード: "ford",
  テスラ: "tesla",
  ゼネラルモーターズ: "gm",
  "GM（ゼネラルモーターズ）": "gm",
  フォルクスワーゲン: "vw",
  "メルセデス・ベンツ": "mercedes",
  ルノー: "renault",
  吉利汽車: "geely",
  長城汽車: "greatwall",
  起亜: "kia",
  "サムスンSDI": "samsung-sdi",
  "LGエナジーソリューション": "lges",
  ソニーセミコンダクタソリューションズ: "sony",
  ダイハツ工業: "daihatsu",
  "三菱ふそうトラック・バス": "fuso",
  "UDトラックス": "udtrucks",
  パイオニア: "pioneer",
  トピー工業: "topy",
  "プライムプラネットエナジー&ソリューションズ": "ppes",
};

export function resolveCompanyIds(rec: NewsRecord): string[] {
  const ids = new Set<string>();
  for (const t of rec.tickers ?? []) {
    const id = BY_TICKER_PREFIX.get(t);
    if (id) ids.add(id);
  }
  for (const name of rec.company ?? []) {
    const id = BY_NAME.get(name) ?? NAME_ALIASES[name];
    if (id) ids.add(id);
  }
  return Array.from(ids);
}
