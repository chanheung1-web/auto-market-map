<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# このアプリ固有の前提

## 何を見せるアプリか

自動車バリューチェーンを6階層（完成車 → 部品 → 電池 → 半導体 → ソフトウェア → 素材）に
分け、世界地図で地域ごとの温度感を、一覧で銘柄ごとの動きを見る。
**単発の株価を調べるためのアプリではない**（それは stock-trading-app の役割）。
「今日はどの層が、どの地域で動いたか」を掴むのが目的なので、
情報を足すときは常にこの問いに答えるかどうかで判断する。

## 地図の色は指数ではなく「監視銘柄の単純平均」

自動車株には地域別の既製指数が存在しないため、`summarizeRegions()` が
`src/lib/companies.ts` の銘柄を地域ごとに束ねて騰落率を平均している。

**時価総額加重にしていないのは意図的**。加重すると日本＝トヨタ、米国＝テスラの
動きにほぼ一致してしまい、「地域の中で何が起きているか」が見えなくなる。
そのぶん平均は指数の代用にはならないので、UI で指数のように見せてはいけない。
バッジに `N↑ M↓` を併記しているのは、平均だけでは「全体が少し上げた日」と
「半分が急騰し半分が急落した日」が同じ色になるため。

## 銘柄マスタは手動管理。上場廃止は404で気づく

`src/lib/companies.ts` は自動更新されない。Yahoo が 404 を返すようになったら
上場廃止・分割・統合が起きたサインなので、シンボルを直すこと。
実際に対応済みの例：

- 日野自動車 7205.T → 404。代替が見つからず `code: null`（構造データとしてのみ残す）
- Tata Motors → 乗用車 TMPV.NS と商用車 TMCV.NS に分割。旧 TATAMOTORS.NS は 404
- 豊田自動織機 6201.T → 404。米OTCのADR TYIDY で代用（**ドル建てなので為替を含む**）

`code: null` は非上場・取得不可を表す。株価も地図の集計にも入らないが、
ボッシュ・ZFのように業界構造の理解に外せない企業は一覧に残す。

## auto-industry-watcher とは読み取り専用の関係

`/api/news` が隣フォルダ `../auto-industry-watcher/data/news/*.jsonl` を
ファイルとして直接読む（stock-trading-app が `../market-briefing` を読むのと同じ方式。
GitHub API ではないのでトークン不要）。

あちらの収集エージェントは「既存行を書き換えない・追記のみ」で動いているので、
**このアプリから data/news/ に書き込まないこと**。
隣フォルダが無くてもこのアプリは株価だけで成立する必要があるため、
`loadRecentNews()` は読めないとき throw せず空配列を返す。

ニュース側の `tickers` は素の証券コード（"7203"）、こちらの `code` は Yahoo
シンボル（"7203.T"）なので、そのままでは突き合わせられない。
`src/lib/news.ts` の `resolveCompanyIds()` が接頭辞と社名エイリアスで解決している。
社名表記が食い違う分は `NAME_ALIASES` に足す。

## ポートは 3002

stock-trading-app が 3000、ai-datacenter-tracker が 3001 を使っている。
別デバイス（Tailscale経由のiPhone/iPad）から開く場合は、
ファイアウォールでプライベートプロファイル限定で 3002 を開ける必要がある
（手順はワークスペース直下の CLAUDE.md を参照）。

## モバイル前提

iPhone / iPad から見る。地図のバッジは狭い画面で重なりやすいので、
`REGION_POSITION` を触ったら必ず狭い幅で確認すること。
