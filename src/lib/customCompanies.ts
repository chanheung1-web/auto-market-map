import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { COMPANIES, LAYER_ORDER, type Company, type Layer, type Region } from "./companies";
import { REGION_ORDER } from "./regions";

// 追加した銘柄と、非表示にした組み込み銘柄をサーバー側に持つ。
//
// ai-datacenter-tracker は同じ機能を localStorage でやっているが、こちらは
// stock-trading-app と同じく **PC と iPhone の両方から使う**前提なので、
// 端末ごとに監視リストが変わってしまう localStorage では要件を満たさない。
// サーバー側のこのファイルが唯一の正本。
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "custom-companies.json");

type Store = {
  /** 画面から追加した銘柄。 */
  added: Company[];
  /** 非表示にした組み込み銘柄の id。組み込み側は消さずに隠すだけにする。 */
  removedIds: string[];
};

const EMPTY: Store = { added: [], removedIds: [] };

async function readStore(): Promise<Store> {
  try {
    const parsed: unknown = JSON.parse(await readFile(STORE_FILE, "utf8"));
    if (!parsed || typeof parsed !== "object") return EMPTY;
    const s = parsed as Partial<Store>;
    return {
      added: Array.isArray(s.added) ? s.added : [],
      removedIds: Array.isArray(s.removedIds) ? s.removedIds : [],
    };
  } catch {
    // 初回はファイルが無い。これは異常ではない。
    return EMPTY;
  }
}

async function writeStore(store: Store): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

/** 組み込み＋追加ぶん、非表示を除いた実際の監視対象。 */
export async function loadAllCompanies(): Promise<Company[]> {
  const { added, removedIds } = await readStore();
  const removed = new Set(removedIds);
  return [...COMPANIES.filter((c) => !removed.has(c.id)), ...added];
}

/** 追加した銘柄かどうか（UI で削除ボタンの出し分けに使う）。 */
export async function addedIds(): Promise<string[]> {
  return (await readStore()).added.map((c) => c.id);
}

/** 非表示にした組み込み銘柄。UI から戻せるようにするために名前も返す。 */
export async function hiddenBuiltins(): Promise<{ id: string; name: string }[]> {
  const { removedIds } = await readStore();
  const byId = new Map(COMPANIES.map((c) => [c.id, c.name]));
  return removedIds
    .filter((id) => byId.has(id))
    .map((id) => ({ id, name: byId.get(id)! }));
}

/** 非表示を解除する。追加ぶんの削除は取り消せない（実体を消しているため）。 */
export async function restoreCompany(id: string): Promise<void> {
  const store = await readStore();
  if (!store.removedIds.includes(id)) return;
  store.removedIds = store.removedIds.filter((x) => x !== id);
  await writeStore(store);
}

export type AddInput = {
  name: string;
  code: string;
  layer: string;
  region: string;
  country?: string;
  exchange?: string;
  position?: string;
};

export type AddResult = { ok: true; company: Company } | { ok: false; error: string };

/**
 * Yahoo にそのシンボルが実在するかを確かめる。
 *
 * 手入力のシンボルは打ち間違えやすく（日本株の `.T` 付け忘れが特に多い）、
 * 保存できてしまうと一覧に「取得失敗」の行が残り続ける。保存前に弾く。
 */
async function verifySymbol(code: string): Promise<{ ok: boolean; currency?: string }> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(code)}?range=1d&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" }
    );
    if (!res.ok) return { ok: false };
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    return { ok: typeof meta?.regularMarketPrice === "number", currency: meta?.currency };
  } catch {
    return { ok: false };
  }
}

function slugify(code: string): string {
  return `custom-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export async function addCompany(input: AddInput): Promise<AddResult> {
  const name = input.name?.trim();
  const code = input.code?.trim().toUpperCase();

  if (!name) return { ok: false, error: "銘柄名を入力してください" };
  if (!code) return { ok: false, error: "シンボルを入力してください" };
  if (!LAYER_ORDER.includes(input.layer as Layer)) {
    return { ok: false, error: "階層の指定が不正です" };
  }
  if (!REGION_ORDER.includes(input.region as Region)) {
    return { ok: false, error: "地域の指定が不正です" };
  }

  const store = await readStore();
  const existing = [...COMPANIES, ...store.added].find(
    (c) => c.code?.toUpperCase() === code
  );
  if (existing) {
    return { ok: false, error: `${existing.name} として既に登録されています` };
  }

  const verified = await verifySymbol(code);
  if (!verified.ok) {
    return {
      ok: false,
      error: `Yahoo でシンボル ${code} の株価を取得できませんでした。日本株は末尾に .T が必要です（例: 6902.T）`,
    };
  }

  const company: Company = {
    id: slugify(code),
    name,
    code,
    exchange: input.exchange?.trim() || verified.currency || null,
    region: input.region as Region,
    country: input.country?.trim() || input.region,
    layer: input.layer as Layer,
    position: input.position?.trim() || "画面から追加",
  };

  store.added.push(company);
  await writeStore(store);
  return { ok: true, company };
}

/**
 * 監視対象から外す。追加ぶんは実体を消し、組み込みぶんは非表示リストに入れる
 * （組み込みを実体ごと消すと、コード側を更新したときに復活してしまうため）。
 */
export async function removeCompany(id: string): Promise<void> {
  const store = await readStore();
  if (store.added.some((c) => c.id === id)) {
    store.added = store.added.filter((c) => c.id !== id);
  } else if (COMPANIES.some((c) => c.id === id) && !store.removedIds.includes(id)) {
    store.removedIds.push(id);
  }
  await writeStore(store);
}
