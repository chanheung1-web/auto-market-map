// 保有・ウォッチ状況の型と、コードの正規化。
//
// このファイルはクライアントからも読まれるので、node:fs を import しないこと。
// 実ファイルの読み取りは portfolio.server.ts 側にある。

export type PortfolioLink = {
  /** Yahoo シンボルの接頭辞（"7203.T" なら "7203"）をキーにした保有株数。 */
  heldQuantityByCode: Record<string, number>;
  watchedCodes: string[];
  /** 読めなかった場合の理由。UI で「未連携」と出し分けるために持つ。 */
  error: string | null;
};

/**
 * 証券コードを突き合わせ用に正規化する。
 *
 * 保有側は素のコード（"7201" "NVDA"）だが、ウォッチリストには "005930.KS" のように
 * 取引所サフィックス付きの行が混在し、こちらの `code` は Yahoo シンボル（"7201.T"）。
 * 三者を揃えるため、最初のドットより前だけを見る。
 */
export function normalizeCode(code: string): string {
  return code.split(".")[0].toUpperCase();
}
