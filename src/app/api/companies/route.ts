import {
  addCompany,
  addedIds,
  hiddenBuiltins,
  loadAllCompanies,
  removeCompany,
  restoreCompany,
} from "@/lib/customCompanies";
import { loadPortfolioLink } from "@/lib/portfolio.server";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" } as const;

/** 一覧を変更したあと、画面が必要とする状態をひとまとめで返す。 */
async function currentState() {
  const [companies, added, hidden] = await Promise.all([
    loadAllCompanies(),
    addedIds(),
    hiddenBuiltins(),
  ]);
  return { companies, addedIds: added, hidden };
}

/** 監視対象の一覧と、保有・ウォッチの紐付けをまとめて返す。 */
export async function GET() {
  const [state, portfolio] = await Promise.all([currentState(), loadPortfolioLink()]);
  return Response.json({ ...state, portfolio }, { headers: NO_STORE });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "リクエストが不正です" }, { status: 400 });
  }

  // 非表示の解除も同じエンドポイントで受ける（どちらも「一覧を元に戻す方向」の操作で、
  // 返す状態がまったく同じなので、経路を分けるとハンドラが重複するだけになる）。
  const restoreId = (body as { restoreId?: string })?.restoreId;
  if (restoreId) {
    await restoreCompany(restoreId);
    return Response.json({ ok: true, ...(await currentState()) }, { headers: NO_STORE });
  }

  const result = await addCompany(body as Parameters<typeof addCompany>[0]);
  if (!result.ok) {
    // 入力ミス（シンボルの打ち間違い等）が大半なので 400 で返し、
    // 画面側はメッセージをそのまま出す。
    return Response.json(result, { status: 400, headers: NO_STORE });
  }

  return Response.json({ ...result, ...(await currentState()) }, { headers: NO_STORE });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ ok: false, error: "id が必要です" }, { status: 400 });

  await removeCompany(id);
  return Response.json({ ok: true, ...(await currentState()) }, { headers: NO_STORE });
}
