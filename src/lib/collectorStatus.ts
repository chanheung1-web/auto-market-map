// 日次ニュース収集の健全性。クライアントからも読むので node:fs を import しないこと。
// 判定ロジックは collectorStatus.server.ts 側にある。

export type CollectorStatus = {
  /**
   * ok       … 正常
   * auth     … 認証切れで失敗中（対処はログインし直すだけ）
   * limit    … 使用量の上限で失敗（リセット後に手動で再実行しないとその日は欠ける）
   * failing  … 認証以外の理由で失敗中
   * stale    … 実行自体がされていない（PCの電源断・タスク無効化など）
   * unknown  … ログが読めず判定不能（隣フォルダが無い環境など）
   */
  state: "ok" | "auth" | "limit" | "failing" | "stale" | "unknown";
  /** 画面に出す文。ok / unknown では null。 */
  message: string | null;
  /** 最後に成功した日（YYYY-MM-DD）。 */
  lastSuccess: string | null;
  /** 連続で失敗している日数。 */
  failingDays: number;
};
