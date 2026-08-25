// ダイジェストレポートの型。クライアントからも読まれるので、
// このファイルには node:fs を import しないこと。
// 実ファイルの読み取りは topics.server.ts 側にある。

export type TopicReport = {
  kind: "weekly" | "daily";
  /** ファイル名から取ったキー。週次は "2026-W34"、日次は "2026-08-25"。 */
  id: string;
  /** 見出し行（# を除いたもの）。 */
  title: string;
  /** 本文（見出し行を除く Markdown 原文）。 */
  body: string;
  /** 並べ替え用。日次は日付、週次はその週の識別子から作った近似日付。 */
  sortKey: string;
};
