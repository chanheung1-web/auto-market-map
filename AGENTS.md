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

## サーバー専用コードは `*.server.ts` に分ける

`node:fs` を使うモジュールをクライアントコンポーネントから import すると、
Turbopack が `the chunking context does not support external modules (request: node:fs/promises)`
で**ビルドごと落ちる**（型だけの import なら消えるが、定数や関数を1つでも
値として import した時点で巻き込まれる）。実際にこれで一度ビルドが壊れた。

そのため対になるファイルに分けてある。

| クライアントからも読む | サーバー専用 |
|---|---|
| `news.ts`（型・`RECENT_DAYS`・`resolveCompanyIds`） | `news.server.ts`（JSONL読み取り） |
| `portfolio.ts`（型・`normalizeCode`） | `portfolio.server.ts`（holdings/watchlist読み取り） |
| `topics.ts`（型） | `topics.server.ts`（Markdown読み取り） |

`*.server.ts` の先頭には `import "server-only"` を置く。間違えて
クライアントから import したとき、ビルドの謎エラーではなく
「サーバー専用モジュールです」という明示的なエラーになる。

## 日付は必ずローカルの暦日で組み立てる

`new Date().toISOString().slice(0,10)` を日付の比較に使ってはいけない。
UTCに変換されるため、**日本時間の早朝に実行すると1日前にずれる**
（8/26 02:00 JST は UTC では 8/25）。実際にこれでニュースの足切りが
1日ぶん緩くなっていた。JSONL の `date` もレポートのファイル名も
日本時間の暦日なので、こちら側も `getFullYear()/getMonth()/getDate()` で
組み立てて揃える（`news.server.ts` の `cutoffDate()` 参照）。

## 保有・ウォッチは stock-trading-app が正本

`portfolio.server.ts` が `../stock-trading-app/data/holdings.json` と
`watchlist.json` を実行時に読む。**このアプリに保有情報を持たせないこと。**

以前 `companies.ts` に `held: true` を静的に持っていたが、実際の保有と
食い違った（トヨタ・日本製鉄を保有扱いにしていたが、実際の自動車関連の保有は
日産・日立・NVIDIA だった）。あちらは PC と iPhone の両方から編集されるので、
コピーを持った時点で必ず古くなる。

コードの突き合わせは `normalizeCode()` で最初のドットより前を見る。
保有側は素のコード（"7201"）、ウォッチリストには "005930.KS" のような
サフィックス付きが混在し、こちらは Yahoo シンボル（"7201.T"）だから。

## 監視対象は画面から追加・削除できる

`data/custom-companies.json` がサーバー側の正本（`customCompanies.ts`）。
ai-datacenter-tracker は同じ機能を localStorage でやっているが、こちらは
**PC と iPhone の両方から使う**ので端末ごとに監視リストが変わると困る。

- 追加は保存前に Yahoo でシンボルを検証する（`.T` の付け忘れが多いため）
- 組み込み銘柄の削除は`removedIds`に入れる**非表示**であって実体は消さない
  （コード側を更新したときに復活してしまうため）。非表示は画面から戻せる
- 追加した銘柄の削除だけは実体を消すので戻せない

## auto-industry-watcher とは読み取り専用の関係

`/api/news` が隣フォルダ `../auto-industry-watcher/data/news/*.jsonl` を
ファイルとして直接読む（stock-trading-app が `../market-briefing` を読むのと同じ方式。
GitHub API ではないのでトークン不要）。

あちらの収集エージェントは「既存行を書き換えない・追記のみ」で動いているので、
**このアプリから data/news/ に書き込まないこと**。
隣フォルダが無くてもこのアプリは株価だけで成立する必要があるため、
`loadRecentNews()` は読めないとき throw せず空配列を返す。

読むものは2種類ある。**性格が違うので画面上も分けている。**

| 何 | どこ | 画面 |
|---|---|---|
| 個別ニュース（1件＝1事実） | `data/news/*.jsonl` | 「個別ニュース」。銘柄で絞れる |
| 編集済みダイジェスト（論点） | `reports/weekly/*.md`, `reports/daily/*.md` | 「重要トピック」。ページ上部 |

週次レポートは「今週の3大トピック」まで人手で絞り込んだ結果なので、
個別ニュースより読む価値が高い。だから上に置いている。

ニュース側の `tickers` は素の証券コード（"7203"）、こちらの `code` は Yahoo
シンボル（"7203.T"）なので、そのままでは突き合わせられない。
`src/lib/news.ts` の `resolveCompanyIds()` が接頭辞と社名エイリアスで解決している。
社名表記が食い違う分は `NAME_ALIASES` に足す。

ニュースは**直近60日ぶんだけ**読む（`RECENT_DAYS`）。件数では打ち切らない。
銘柄の `news N` バッジは「この企業に今何か起きている」の合図なので、
2か月前の記事で点灯すると最近動きのある企業を見分けられなくなる。
件数で打ち切ると「上限で消えた」のか「最近ニュースがない」のかも区別できなくなる。

## 銘柄検索は二段構え（日本語が引けない問題）

Yahoo の英語版検索は**日本語の社名をまったく索引していない**。「東海理化」も
「トヨタ」も0件どころか **HTTP 400** が返る（stock-trading-app の symbol-search も
同じ制約を抱えている）。

そのため `/api/symbol-search` は、日本語を含むクエリで英語版が空だったときだけ
**Yahoo!ファイナンス日本版の検索ページをHTMLで読み**、`/quote/6995` の形のリンクから
証券コードを拾い、そのコードを英語版に流し込んで正式名称と取引所を得ている。

- 英語版の失敗は throw させず「0件」として扱うこと。throw すると日本語の
  フォールバックに到達しない（一度これで日本語検索が丸ごと死んでいた）
- HTML を読む経路なので壊れやすい。ここが失敗しても検索全体は落とさない
- コードは上位6件までに絞る。1コードにつき英語版へ1往復するので待ち時間に直結する

## ポートは 3002

stock-trading-app が 3000、ai-datacenter-tracker が 3001 を使っている。
別デバイス（Tailscale経由のiPhone/iPad）から開く場合は、
ファイアウォールでプライベートプロファイル限定で 3002 を開ける必要がある
（手順はワークスペース直下の CLAUDE.md を参照）。

## iPhone から見るための設定

3000番と同じ手順が要る。**両方やらないと繋がらない。**

1. `setup-firewall.ps1` を管理者権限で1回実行 → プライベートプロファイル限定で3002を開放
2. `next.config.ts` の `allowedDevOrigins` … dev サーバーは origin が localhost 以外の
   リクエストを弾くため、Tailscale名とIPを列挙してある。`next start`（本番）には
   この制限がないので不要だが、`start-app.bat` は dev を起動するので必要

このマシンの Tailscale アドレスが変わったら、stock-trading-app 側の
`next.config.ts` と揃えて両方直すこと。

入力欄のフォントは `text-base sm:text-sm` にしてある。iOS は 16px 未満の
input にフォーカスすると**画面を勝手にズームする**ため、モバイル幅では
16px を下回らせない。

## 固定ナビとアンカー

ページは電話だと数画面ぶんある。上部の固定バーから各セクションへ飛べる
（stock-trading-app の `SECTIONS` と同じ作り）。

セクションを足したら **`SECTIONS` 配列と `id` の両方**を足すこと。
`id` には必ず `scroll-mt-24` を付ける。これが無いと、アンカーで飛んだときに
見出しが固定バーの裏に隠れて、どこに来たのか分からなくなる。
`scroll-margin-top` は `scrollIntoView()` にも効くので、銘柄選択で
ニュース欄へ飛ぶときも同じ余白が使われる。

固定バーの `-mx-3 sm:-mx-6` は親の余白を打ち消すため。付け忘れると
スクロール時にバーの左右から中身が透けて見える。

## モバイル前提とレイアウトの揺れ

iPhone / iPad から見る。地図のバッジは狭い画面で重なりやすいので、
`REGION_POSITION` を触ったら必ず狭い幅で確認すること。

`globals.css` の `scrollbar-gutter: stable` は消さないこと。
銘柄を選ぶとニュース欄の中身が入れ替わってページの高さが変わり、
スクロールバーが出たり消えたりして**画面が横に揺れていた**。

一覧の価格列に `w-24 sm:w-28` の固定幅を入れているのも同じ理由で、
「保有」「ウォッチ」「news N」バッジの有無で価格の位置が行ごとにずれると、
数字を縦に読めなくなる。
