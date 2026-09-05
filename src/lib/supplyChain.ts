import type { Layer } from "./companies";

// 自動車サプライチェーンの部品カテゴリ別マップ。
//
// 出典は OneDrive の automotive_supply_chain_v2.xlsx（2026-04-22 時点、2024年基準）。
// Excel 側は Mordor Intelligence / MarketsandMarkets / TechInsights / Grand View
// Research 等の市場調査レポートを突き合わせた推計で、**シェアは各社推計値（±数%）**。
// 調査会社ごとに市場の定義が違うため、カテゴリ間で金額を足して「市場合計」を
// 作ってはいけない（ai-datacenter-tracker の marketSegments.ts と同じ注意）。
//
// このファイルは Excel から生成した静的スナップショット。数字を直したくなったら
// Excel 側を直して作り直すのではなく、ここを直して出典を notes に残すこと
// （Excel はもう更新されない前提で、こちらを正本として運用する）。
//
// `companyId` は src/lib/companies.ts の監視銘柄への紐付け。null は
// このアプリが株価を追っていない企業（非上場、または未登録）を表す。

export type SupplyPlayer = {
  /** カテゴリ内の順位（1〜5）。 */
  rank: number;
  name: string;
  /** 本社。国旗絵文字＋国名が入る。 */
  hq: string;
  /** 元の表記のまま（"~25%" など）。 */
  share: string;
  /** 棒グラフ用に数値化したもの。取れなければ null。 */
  sharePercent: number | null;
  shareNote: string;
  products: string;
  strategy: string;
  note: string;
  /** 監視銘柄の id。株価やニュースに繋ぐために使う。 */
  companyId: string | null;
};

export type SupplyCategory = {
  id: string;
  /** バリューチェーンのどの階層の話か。既存の階層タブと同じ区分。 */
  layer: Layer;
  title: string;
  subtitle: string;
  marketSize: string;
  cagr: string;
  /** 成長ドライバー（Excel のメタ行の残り）。 */
  driver: string;
  summary: string;
  /** 数字の出どころと時点。Excel 由来か、後から個別に調べたものかを区別する。 */
  source: string;
  players: SupplyPlayer[];
};

export const SUPPLY_CATEGORIES: SupplyCategory[] = [
  {
    id: "c1-metal鋼材",
    layer: "MATERIAL",
    title: "Metal部品",
    subtitle: "鋼材 (高張力鋼板・ボディ・構造材)",
    marketSize: "~$94B (シャシー市場換算)",
    cagr: "5.5%",
    driver: "EV向け超高張力鋼需要が拡大",
    summary: "車体外板・骨格・強度部材に用いる高張力鋼(HSS/UHSS)サプライヤー。ArcelorMittal・新日鉄・POSCOが三強。EV化でギガキャスト（アルミ一体鋳造）への一部置き換えが進むが、コスト競争力から鋼材も継続需要。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "ArcelorMittal", hq: "🇱🇺 ルクセンブルク", share: "~12%", sharePercent: 12, shareNote: "鉄鋼首位", products: "Usibor/Ductibor 超高張力鋼", strategy: "ホットスタンプ用鋼材の技術リーダー", note: "鋼材グローバル生産量No.1", companyId: "arcelormittal" },
      { rank: 2, name: "Nippon Steel (新日鉄住金)", hq: "🇯🇵 日本", share: "~8%", sharePercent: 8, shareNote: "鉄鋼2位", products: "高張力鋼板・電磁鋼板", strategy: "Toyota・Hondaの主要調達先", note: "EV向けモーターコア材も強化中", companyId: "nipponsteel" },
      { rank: 3, name: "POSCO", hq: "🇰🇷 韓国", share: "~7%", sharePercent: 7, shareNote: "鉄鋼3位", products: "ギガスチール・PosH系", strategy: "Hyundai向け供給強み", note: "H-型鋼・冷延鋼板幅広く展開", companyId: null },
      { rank: 4, name: "ThyssenKrupp", hq: "🇩🇪 ドイツ", share: "~6%", sharePercent: 6, shareNote: "鉄鋼4位", products: "プレス成形用高張力鋼", strategy: "欧州OEM向け鋼材", note: "スチールサービスセンター機能", companyId: null },
      { rank: 5, name: "SSAB", hq: "🇸🇪 スウェーデン", share: "~4%", sharePercent: 4, shareNote: "鉄鋼5位", products: "Hardox耐摩耗鋼板", strategy: "グリーンスチール (HYBRIT)先行", note: "CO2フリー鋼材開発で注目", companyId: null },
    ],
  },
  {
    id: "c2-metalアルミ",
    layer: "MATERIAL",
    title: "Metal部品",
    subtitle: "アルミニウム部品 (ボディパネル・シャシー・鋳造品)",
    marketSize: "~$87B",
    cagr: "10.7%",
    driver: "EVシフトで最高成長率カテゴリの一つ",
    summary: "圧延アルミ・鋳造アルミ・押出アルミを自動車向けに供給。Novelisが圧延アルミで世界首位。EVのバッテリー筐体・ボディ軽量化需要が急拡大。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Novelis (Hindalco子会社)", hq: "🇮🇳/🇺🇸", share: "~18%", sharePercent: 18, shareNote: "圧延首位", products: "圧延アルミ (ボディシート全般)", strategy: "リサイクルアルミ戦略・低炭素", note: "自動車向け圧延アルミ世界No.1", companyId: null },
      { rank: 2, name: "Constellium SE", hq: "🇳🇱 オランダ", share: "~12%", sharePercent: 12, shareNote: "圧延2位", products: "アルミ構造材・BIW部品", strategy: "Tesla/BMW長期供給契約", note: "CES 2024で新世代アルミ構造体発表", companyId: null },
      { rank: 3, name: "Norsk Hydro", hq: "🇳🇴 ノルウェー", share: "~10%", sharePercent: 10, shareNote: "総合3位", products: "押出・圧延・鋳造全般", strategy: "グリーンアルミ・低炭素製品", note: "垂直統合型。Porscheとグリーンアルミ提携", companyId: null },
      { rank: 4, name: "Arconic", hq: "🇺🇸 米国", share: "~8%", sharePercent: 8, shareNote: "押出4位", products: "アルミ押出部品・パネル", strategy: "構造部品・防衛向けも展開", note: "Alcoa分社化後に自動車特化", companyId: null },
      { rank: 5, name: "UACJ Corporation", hq: "🇯🇵 日本", share: "~6%", sharePercent: 6, shareNote: "鋳造5位", products: "アルミ圧延・鋳造", strategy: "日系OEM向け安定供給", note: "三菱マテリアル・住友軽金属合併", companyId: null },
    ],
  },
  {
    id: "c3-シャシー-サスペンション",
    layer: "TIER1",
    title: "シャシー・サスペンション",
    subtitle: "シャシー・フレーム / サスペンション・ステアリング",
    marketSize: "シャシー:~$94B / サスペンション:~$47B",
    cagr: "4.8~6.7%",
    driver: "EVスケートボードシャシーで設計思想が変革中",
    summary: "車両骨格・走行安定系を担うカテゴリ。シャシーはMagna・Gestamp・Bentelerが三強。サスペンションはZF・Tenneco・KYBが主要プレイヤー。EV化でギガキャスト採用が拡大中。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "ZF Friedrichshafen", hq: "🇩🇪 ドイツ", share: "~8%", sharePercent: 8, shareNote: "サスペンション首位", products: "電子制御エアサスペンション", strategy: "センサー統合型スマートサスペンション", note: "全方位メガサプライヤー。パワートレインも", companyId: "zf" },
      { rank: 2, name: "Magna International", hq: "🇨🇦 カナダ", share: "~10%", sharePercent: 10, shareNote: "シャシー首位", products: "フレーム・クロスメンバー・BIW全般", strategy: "EV向けスケートボード型シャシー", note: "カナダ最大の自動車部品メーカー", companyId: "magna" },
      { rank: 3, name: "Gestamp Automoción", hq: "🇪🇸 スペイン", share: "~8%", sharePercent: 8, shareNote: "シャシー2位", products: "ホットスタンプ成形部品・Bピラー", strategy: "超高張力鋼プレス成形技術", note: "欧州・中国・北米に幅広く展開", companyId: null },
      { rank: 4, name: "Tenneco (DRiV)", hq: "🇺🇸 米国", share: "~7%", sharePercent: 7, shareNote: "サスペンション2位", products: "Monroe/Rancho ダンパー", strategy: "OEM+アフターマーケット両輪", note: "2023年分社化。Apollo Global傘下", companyId: null },
      { rank: 5, name: "KYB Corporation", hq: "🇯🇵 日本", share: "~6%", sharePercent: 6, shareNote: "サスペンション3位", products: "油圧ダンパー・ショックアブソーバ", strategy: "日系OEM向けに高いシェア", note: "世界シェアサスペンション系で安定", companyId: null },
    ],
  },
  {
    id: "c4-シール-ウェザーストリップ",
    layer: "TIER1",
    title: "シール・ウェザーストリップ",
    subtitle: "ウェザーストリップ / Glass Run / ドア・トランクシール",
    marketSize: "~$9.2B (ウェザーストリップ)",
    cagr: "3.5%",
    driver: "EV向けNVH対策・軽量EPDM素材が成長ドライバー",
    summary: "ドア・窓周囲の雨水・騒音・塵の侵入を防ぐシール部品。Glass Runが最大セグメント。Cooper Standard・豊田合成・Hutchinsonが三強。EV化でNVH（騒音・振動・ハーシュネス）対策ニーズが高まり付加価値化が進む。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Cooper Standard", hq: "🇺🇸 米国", share: "~20%", sharePercent: 20, shareNote: "首位", products: "Weatherstrip全般・Glass run・Fortrex素材", strategy: "EV向け軽量NVHシール・低摩擦素材", note: "北米/欧州/APACに全球展開", companyId: null },
      { rank: 2, name: "Toyoda Gosei (豊田合成)", hq: "🇯🇵 日本", share: "~15%", sharePercent: 15, shareNote: "2位", products: "ドアウェザーストリップ・Glass run・ルーフモール", strategy: "エアロダイナミック設計で空力性能改善", note: "Toyota・Lexus向けが中心", companyId: "toyoda-gosei" },
      { rank: 3, name: "Hutchinson SA", hq: "🇫🇷 フランス", share: "~12%", sharePercent: 12, shareNote: "3位", products: "Flush Glazing・音響封入ガラスシール", strategy: "スマートシール（センサー内蔵）開発", note: "Totalの子会社。欧州プレミアムOEM向け", companyId: null },
      { rank: 4, name: "Nishikawa Rubber (西川ゴム)", hq: "🇯🇵 日本", share: "~10%", sharePercent: 10, shareNote: "4位", products: "ドアシール・Glass run全般", strategy: "日系OEM向け安定供給", note: "広島本社。マツダ・ホンダに強み", companyId: null },
      { rank: 5, name: "SaarGummi Group", hq: "🇩🇪 ドイツ", share: "~6%", sharePercent: 6, shareNote: "5位", products: "欧州OEM向けシール全般", strategy: "Chongqing Casin傘下", note: "欧州高級車ブランド向け供給", companyId: null },
    ],
  },
  {
    id: "c5-タイヤ-ゴム",
    layer: "TIER1",
    title: "ゴム・タイヤ",
    subtitle: "タイヤ / ゴムホース・防振材・Oリング",
    marketSize: "タイヤ:~$173B / ゴム部品:~$15B",
    cagr: "4.7~5.0%",
    driver: "トップ5社でタイヤ市場の60%超を独占。中国勢の台頭が加速",
    summary: "タイヤはMichelin・Bridgestoneが二強。EV向け低転がり抵抗・高荷重タイヤの開発競争が激化中。ゴム防振・シールはNOK・Parker・Freudenbergが主要企業。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Michelin", hq: "🇫🇷 フランス", share: "~15%", sharePercent: 15, shareNote: "タイヤ首位(売上)", products: "Pilot・Primacy・CrossClimate全般", strategy: "持続可能ゴム・センサー内蔵スマートタイヤ", note: "175カ国展開。83工場保有", companyId: "michelin" },
      { rank: 2, name: "Bridgestone", hq: "🇯🇵 日本", share: "~14%", sharePercent: 14, shareNote: "タイヤ2位", products: "Potenza・Turanza・Blizzak", strategy: "EV対応タイヤ・ランフラット技術", note: "収益の約90%がタイヤ事業", companyId: null },
      { rank: 3, name: "Continental (タイヤ部門)", hq: "🇩🇪 ドイツ", share: "~8%", sharePercent: 8, shareNote: "タイヤ3位", products: "ContiEcoContact・EV向け専用タイヤ", strategy: "EV全規格最適化・スマートタイヤ", note: "EV18メーカー上位にタイヤ供給", companyId: "continental" },
      { rank: 4, name: "Goodyear", hq: "🇺🇸 米国", share: "~8%", sharePercent: 8, shareNote: "タイヤ4位", products: "Eagle F1・Assurance・Wrangler", strategy: "自動運転対応センサータイヤ開発", note: "北米で特に強い市場地位", companyId: null },
      { rank: 5, name: "Pirelli", hq: "🇮🇹 イタリア", share: "~5%", sharePercent: 5, shareNote: "タイヤ5位", products: "Pゼロ・Cinturato プレミアム特化", strategy: "F1・高性能ハイエンド特化戦略", note: "中国ChemChina(化工集団)系", companyId: null },
    ],
  },
  {
    id: "c6-樹脂素材",
    layer: "MATERIAL",
    title: "樹脂・プラスチック素材",
    subtitle: "自動車用樹脂・プラスチック素材 (PP/PA/PC/PU等)",
    marketSize: "~$21-33B",
    cagr: "7.5%",
    driver: "EV向けバッテリーケース・難燃素材が急拡大",
    summary: "バンパー・ダッシュボード・バッテリーケースなどの樹脂素材供給。BASF・SABIC・LyondellBasellが上流素材を支配。EV化でPA6/PPSなどの難燃・高耐熱エンプラが急拡大中。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "BASF SE", hq: "🇩🇪 ドイツ", share: "~12%", sharePercent: 12, shareNote: "首位", products: "Ultramid(PA)・Ultradur(PBT)・Elastollan", strategy: "バイオマスバランス対応グリーン樹脂", note: "自動車向けエンプラで業界No.1", companyId: null },
      { rank: 2, name: "SABIC (Saudi Aramco系)", hq: "🇸🇦 サウジ", share: "~10%", sharePercent: 10, shareNote: "2位", products: "PP・PC・エンプラ全般 BLUEHERO™", strategy: "EV向け難燃電池ケース素材強化", note: "世界最大規模の石化企業の一つ", companyId: null },
      { rank: 3, name: "LyondellBasell", hq: "🇳🇱 オランダ", share: "~9%", sharePercent: 9, shareNote: "3位", products: "PP (Hifax/Schulamid) 世界最大手", strategy: "低VOC内装材・再生PP対応", note: "PPで世界最大の供給力を持つ", companyId: null },
      { rank: 4, name: "Covestro AG", hq: "🇩🇪 ドイツ", share: "~8%", sharePercent: 8, shareNote: "4位", products: "ポリカーボネート(PC)・PU全般", strategy: "リサイクルPC (Makrolon RP)", note: "グレーズィング・LEDカバーに強み", companyId: null },
      { rank: 5, name: "DuPont / Zytel", hq: "🇺🇸 米国", share: "~6%", sharePercent: 6, shareNote: "5位", products: "ナイロン(PA)・高耐熱樹脂 Zytel", strategy: "EV向けコネクタ周辺高耐熱素材", note: "電装周辺樹脂・自動車構造部材に強み", companyId: null },
    ],
  },
  {
    id: "c7-シート",
    layer: "TIER1",
    title: "内装部品（シート・ヘッドライナー等）",
    subtitle: "シート (シートフレーム・フォーム・表皮・電動機構)",
    marketSize: "~$54-71B",
    cagr: "1.2-3.6%",
    driver: "電動調整・マッサージ・通気機能で付加価値競争が激化",
    summary: "車内最大の内装部品。Adient・Lear・Faureciaが三強でオリゴポリー構造。EV化でシートアーキテクチャの再設計や軽量化需要が増加。ヒーター・ベンチレーション・マッサージ機能付きの高付加価値シートが利益貢献。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Adient PLC", hq: "🇮🇪/🇺🇸", share: "~22%", sharePercent: 22, shareNote: "首位", products: "シートフレーム・フォーム・表皮全般", strategy: "EV向け軽量化・リサイクル素材シート", note: "旧Johnson Controls シート部門", companyId: null },
      { rank: 2, name: "Lear Corporation", hq: "🇺🇸 米国", share: "~18%", sharePercent: 18, shareNote: "2位", products: "シートシステム・電動シートフレーム", strategy: "Kongsberg ICS買収で機能強化", note: "電気系統（ハーネス）も事業の柱", companyId: "lear" },
      { rank: 3, name: "Faurecia (FORVIA)", hq: "🇫🇷 フランス", share: "~15%", sharePercent: 15, shareNote: "3位", products: "シートフレーム・表皮・エルゴ機能", strategy: "HELLA買収でコックピット統合へ", note: "111,000人規模の超大型Tier1", companyId: "forvia" },
      { rank: 4, name: "Toyota Boshoku (トヨタ紡織)", hq: "🇯🇵 日本", share: "~12%", sharePercent: 12, shareNote: "4位", products: "シート・内装トリム・フィルター", strategy: "Toyota向けが主。電動シート強化", note: "トヨタグループの内装主要サプライヤー", companyId: "toyota-boshoku" },
      { rank: 5, name: "Magna International", hq: "🇨🇦 カナダ", share: "~8%", sharePercent: 8, shareNote: "5位", products: "シート・閉断面フレーム", strategy: "全体Tier1として複合展開", note: "シート以外に多角的に展開", companyId: "magna" },
    ],
  },
  {
    id: "c8-ヘッドライナー-内装トリム",
    layer: "TIER1",
    title: "内装部品（シート・ヘッドライナー等）",
    subtitle: "ヘッドライナー / NVH素材 / インパネ / ドアトリム",
    marketSize: "~$8-20B (各セグメント合計)",
    cagr: "4.5-4.8%",
    driver: "軽量不織布・リサイクル素材へのシフトが加速",
    summary: "ヘッドライナー・ドアライニング・インパネ（ダッシュボード）等の内装トリム部品。Grupo Antolin・Toyota Boshoku・Faureciaが主要プレイヤー。EV化でNVH（静粛性）強化ニーズが高まり、ヘッドライナー等の吸音設計が重要化。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Grupo Antolin", hq: "🇪🇸 スペイン", share: "~20%", sharePercent: 20, shareNote: "ヘッドライナー首位", products: "ヘッドライナー・オーバーヘッドシステム", strategy: "内蔵型照明・センサー統合モジュール", note: "ヘッドライナーでグローバルNo.1", companyId: null },
      { rank: 2, name: "Toyota Boshoku (トヨタ紡織)", hq: "🇯🇵 日本", share: "~15%", sharePercent: 15, shareNote: "2位", products: "内装トリム・ドアライニング全般", strategy: "リサイクル繊維活用・EV向け吸音材", note: "トヨタ系内装部品の主要サプライヤー", companyId: "toyota-boshoku" },
      { rank: 3, name: "Faurecia (FORVIA)", hq: "🇫🇷 フランス", share: "~12%", sharePercent: 12, shareNote: "3位", products: "インパネ・内装モジュール全般", strategy: "コックピット統合型モジュール化", note: "コックピット・オブ・ザ・フューチャー", companyId: "forvia" },
      { rank: 4, name: "Yanfeng Automotive", hq: "🇨🇳 中国", share: "~10%", sharePercent: 10, shareNote: "4位", products: "ダッシュボード・インパネ・内装全般", strategy: "中国EV向けに急成長", note: "旧JCI・延鋒。中国系でグローバル展開", companyId: null },
      { rank: 5, name: "IAC Group", hq: "🇺🇸 米国", share: "~8%", sharePercent: 8, shareNote: "5位", products: "インパネ・ドアパネル", strategy: "北米OEM向けに安定供給", note: "旧Collins & Aikmanの流れ", companyId: null },
    ],
  },
  {
    id: "c9-ガラス-サンルーフ",
    layer: "TIER1",
    title: "ガラス・サンルーフ",
    subtitle: "フロントガラス・サイドガラス / サンルーフ・パノラマルーフ",
    marketSize: "ガラス:~$25B / サンルーフ:~$8.7B",
    cagr: "5.3~12.1%",
    driver: "スマートガラス・HUDフロントガラス・調光サンルーフが急成長",
    summary: "自動車用ガラスはFuyao・AGC・NSG・Saint-Gobainの4社で約90%を独占する超寡占市場。EV向けパノラマルーフ・スマート調光ガラスの需要が急拡大。サンルーフ（ルーフシステム）はWebastoが単独首位。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Fuyao Glass (福耀玻璃)", hq: "🇨🇳 中国", share: "~34%", sharePercent: 34, shareNote: "ガラス首位", products: "フロント・サイド・リアガラス全般", strategy: "パノラマルーフ・HUDウィンドシールド", note: "中国最大。米国Decatに$400M投資発表", companyId: "fuyao" },
      { rank: 2, name: "AGC (旭硝子)", hq: "🇯🇵 日本", share: "~23%", sharePercent: 23, shareNote: "ガラス2位", products: "自動車用全ガラス・スマートガラス", strategy: "WONDERLITE調光ガラス・EV向け軽量ガラス", note: "バウハウス・化学・電子素材も展開", companyId: "agc" },
      { rank: 3, name: "NSG (Pilkington)", hq: "🇯🇵 日本", share: "~18%", sharePercent: 18, shareNote: "ガラス3位", products: "ウィンドシールド・HUD対応ガラス", strategy: "GM・Cadillac HUDウィンドシールド採用", note: "旧英Pilkingtonを日本板硝子が買収", companyId: null },
      { rank: 4, name: "Saint-Gobain Sekurit", hq: "🇫🇷 フランス", share: "~14%", sharePercent: 14, shareNote: "ガラス4位", products: "ルーフガラス・バックライト全般", strategy: "GLASSDRIVEでウィンドシールドリサイクル", note: "Saint-Gobainの自動車ガラス部門", companyId: null },
      { rank: 5, name: "Webasto Group", hq: "🇩🇪 ドイツ", share: "~25%", sharePercent: 25, shareNote: "サンルーフ首位", products: "サンルーフ・パノラマルーフシステム", strategy: "Luxembourg高技術ガラス新ライン稼働", note: "サンルーフ専業でグローバルNo.1", companyId: null },
    ],
  },
  {
    id: "c10-ハーネス",
    layer: "TIER1",
    title: "ハーネス",
    subtitle: "ワイヤーハーネス (低圧・高圧・光ファイバー)",
    marketSize: "~$57-87B",
    cagr: "4.8-8.2%",
    driver: "EV化で高電圧HVハーネスがCAGR 17%超の急成長",
    summary: "車両全体の電気配線。Yazaki・住友電気が二強で非上場含む日系が強い。EV化で高電圧ハーネス需要が急拡大。労働集約型のためウクライナ・メキシコ・モロッコで製造が集中しており地政学リスクが顕在化。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Yazaki Corporation", hq: "🇯🇵 日本", share: "~25%", sharePercent: 25, shareNote: "圧倒的首位", products: "低圧・高圧ハーネス・コネクタ全般", strategy: "46カ国展開・日系OEM全方位対応", note: "非上場。年商約1.5兆円規模", companyId: "yazaki" },
      { rank: 2, name: "Sumitomo Electric (住友電気工業)", hq: "🇯🇵 日本", share: "~20%", sharePercent: 20, shareNote: "2位", products: "自動車電線・高圧EVハーネス", strategy: "EV向け高電圧システム強化", note: "光ファイバ等も展開する総合電線メーカー", companyId: "sumitomo-electric" },
      { rank: 3, name: "Aptiv PLC", hq: "🇮🇪 アイルランド", share: "~15%", sharePercent: 15, shareNote: "3位", products: "スマートビークルアーキテクチャ", strategy: "ハーネス×制御統合型設計", note: "旧Delphi。電子集約型設計に強み", companyId: "aptiv" },
      { rank: 4, name: "Furukawa Electric (古河電工)", hq: "🇯🇵 日本", share: "~8%", sharePercent: 8, shareNote: "4位", products: "自動車電線・光電複合ハーネス", strategy: "光通信技術活用の次世代ハーネス", note: "日系OEM向け電線・ハーネス", companyId: null },
      { rank: 5, name: "Leoni AG", hq: "🇩🇪 ドイツ", share: "~5%", sharePercent: 5, shareNote: "5位", products: "欧州OEM向けハーネス", strategy: "ウクライナ工場リスクからの回復中", note: "BMW/VW等欧州OEM主要サプライヤー", companyId: null },
    ],
  },
  {
    id: "c11-ecu-ivi",
    layer: "TIER1",
    title: "電子ユニット（ECU/IVI）",
    subtitle: "ECU・ドメインコントローラ / インフォテインメント (IVI/HMI)",
    marketSize: "ECU:~$35B / IVI:~$18B",
    cagr: "8.5-9.2%",
    driver: "SDV（ソフトウェア定義自動車）化で集中型ドメインコントローラへ移行",
    summary: "車両の電子制御を担うECU（エンジン/ABS/ADAS等）とIVI（インフォテインメント）。BoschとContinentalが二強。SDV化により分散ECUから中央集約型アーキへの移行が進み、ソフトウェア開発力が重要差別化要因に。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Robert Bosch", hq: "🇩🇪 ドイツ", share: "~20%", sharePercent: 20, shareNote: "首位", products: "全ECU系・パワートレイン・シャシー制御", strategy: "SDV対応・中央コンピュータアーキ推進", note: "自動車部品全体でも世界No.1", companyId: "bosch" },
      { rank: 2, name: "Continental AG", hq: "🇩🇪 ドイツ", share: "~15%", sharePercent: 15, shareNote: "2位", products: "ADAS・コックピット電子系", strategy: "Aumovioとして分社化・ソフト強化", note: "タイヤ+電子の複合Tier1", companyId: "continental" },
      { rank: 3, name: "Denso Corporation", hq: "🇯🇵 日本", share: "~12%", sharePercent: 12, shareNote: "3位", products: "パワートレイン/EV制御ECU", strategy: "Toyota連携・電動化対応加速", note: "日系OEM向け電子制御で圧倒的", companyId: "denso" },
      { rank: 4, name: "Harman (Samsung子会社)", hq: "🇺🇸/🇰🇷", share: "~22% (IVI)", sharePercent: 22, shareNote: "IVI首位", products: "JBL/Harman カーオーディオ・コネクテッドカー", strategy: "Samsung連携・OTA/クラウド統合", note: "IVI特化でBosch系を超えるシェア", companyId: null },
      { rank: 5, name: "Visteon Corporation", hq: "🇺🇸 米国", share: "~8% (IVI)", sharePercent: 8, shareNote: "IVI5位", products: "デジタルコックピット・クラスターシステム", strategy: "NVIDIA/NXP連携でソフト差別化", note: "非常に多くのOEMにクラスター供給", companyId: null },
    ],
  },
  {
    id: "c12-mcu",
    layer: "SEMI",
    title: "MCU（車載マイコン）",
    subtitle: "車載MCU (マイクロコントローラ) ─ ADAS/EV/安全系",
    marketSize: "~$14B",
    cagr: "8.3%",
    driver: "上位5社で81.5%独占。ISO 26262対応が参入障壁",
    summary: "あらゆるECUの頭脳となるMCU。Infineon AURIX・NXP S32が業界標準。EV/ADASでMCUの演算性能・機能安全対応が急速に高度化。中国勢（AutoChips等）が急追中。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Infineon Technologies", hq: "🇩🇪 ドイツ", share: "~28.5%", sharePercent: 28.5, shareNote: "圧倒的首位", products: "AURIX TC4x / TRAVEO II", strategy: "Marvell買収で車載Ethernet強化", note: "機能安全ASIL-D対応で業界標準MCU", companyId: "infineon" },
      { rank: 2, name: "NXP Semiconductors", hq: "🇳🇱 オランダ", share: "~20%", sharePercent: 20, shareNote: "2位", products: "S32Z/S32E (リアルタイム処理)", strategy: "MRAM+AIアクセラレータ搭載", note: "V2X通信・車載Ethernet対応に強み", companyId: "nxp" },
      { rank: 3, name: "STMicroelectronics", hq: "🇨🇭 スイス", share: "~15%", sharePercent: 15, shareNote: "3位", products: "Stellar E (EVパワートレイン向け)", strategy: "PCM組込み・アナログ統合型", note: "EV電動パワートレイン向けに注力", companyId: "st" },
      { rank: 4, name: "Renesas Electronics", hq: "🇯🇵 日本", share: "~12%", sharePercent: 12, shareNote: "4位", products: "RH850/U2B (ゾーン/ドメイン制御)", strategy: "日系OEM向け長期供給体制", note: "旧NECエレ+三菱半導体。日本圧倒的", companyId: "renesas" },
      { rank: 5, name: "Microchip Technology", hq: "🇺🇸 米国", share: "~6%", sharePercent: 6, shareNote: "5位", products: "PIC32・dsPIC・車載各種", strategy: "長期供給コミットメント強調", note: "ツールチェーン・サポート体制が強み", companyId: "microchip" },
    ],
  },
  {
    id: "c13-パワー半導体",
    layer: "SEMI",
    title: "パワー半導体（SiC/IGBT）",
    subtitle: "SiC MOSFET / IGBT・Si パワーモジュール",
    marketSize: "SiC:~$4B / IGBT:~$8B",
    cagr: "SiC:17.7% / IGBT:7%",
    driver: "800Vプラットフォーム拡大でSiCが加速。上位5社で90%超独占",
    summary: "EV駆動用インバータのキーデバイス。SiCはSTMicro・Infineon・Onsemiが三強。Si-IGBTはInfineon・三菱電機が強い。中国（BYD半導体・StarPower）が国産化を急加速中。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "STMicroelectronics", hq: "🇨🇭 スイス", share: "~32.6%", sharePercent: 32.6, shareNote: "SiC絶対首位", products: "STPOWER 4th Gen SiC MOSFET", strategy: "Tesla等主要EVメーカー向け長期供給", note: "SiC分野で歴史的にシェアNo.1", companyId: "st" },
      { rank: 2, name: "Infineon Technologies", hq: "🇩🇪 ドイツ", share: "~18%", sharePercent: 18, shareNote: "SiC/IGBT両立", products: "CoolSiC / IGBT TRENCHSTOP", strategy: "200mm SiCウエハへ先行移行", note: "Xiaomi SU7設計勝利など躍進中", companyId: "infineon" },
      { rank: 3, name: "Onsemi", hq: "🇺🇸 米国", share: "~16%", sharePercent: 16, shareNote: "SiC3位", products: "EliteSiC MOSFET / Alder Lake", strategy: "Ford・Hyundaiに供給", note: "SiC JFET技術取得で材料自立化", companyId: "onsemi" },
      { rank: 4, name: "Wolfspeed", hq: "🇺🇸 米国", share: "~12%", sharePercent: 12, shareNote: "SiC材料No.1", products: "SiC基板・デバイス", strategy: "8インチSiCウエハ先行者優位", note: "世界最大のSiC基板サプライヤー", companyId: null },
      { rank: 5, name: "ROHM Semiconductor", hq: "🇯🇵 日本", share: "~8%", sharePercent: 8, shareNote: "5位", products: "SiC SBD/MOSFET全般", strategy: "Vitesco向け10億ドル長期契約", note: "Vitesco(Continental)と戦略提携", companyId: "rohm" },
    ],
  },
  {
    id: "c14-adas-soc-カメラ",
    layer: "SOFTWARE",
    title: "ADAS・SoC・カメラ",
    subtitle: "ADAS SoC・自動運転チップ / 車載イメージセンサー",
    marketSize: "~$35B (ADAS全体)",
    cagr: "~21%",
    driver: "最高成長率カテゴリ。AI演算チップとソフトの融合が鍵",
    summary: "ADAS向けSoC（Mobileye・NVIDIA）、カメラモジュール、イメージセンサー（Sony）。L2+/L3自動運転の普及で急拡大。Sonyがイメージセンサーで4割超のシェアを持ち絶対優位。SoC競争はMobileye vs NVIDIAが二極化。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "Mobileye (Intel子会社)", hq: "🇮🇱 イスラエル", share: "~30%", sharePercent: 30, shareNote: "ADAS SoC首位", products: "EyeQ5/6 ADAS SoC", strategy: "SuperVision/Chauffeur L3プラットフォーム", note: "VW・BMW等主要OEMに採用", companyId: "mobileye" },
      { rank: 2, name: "NVIDIA", hq: "🇺🇸 米国", share: "~18%", sharePercent: 18, shareNote: "GPU系首位", products: "DRIVE Thor / Orin SoC", strategy: "CUDA生態系・AI学習優位性", note: "Mercedes・BYD・NIOに採用拡大", companyId: "nvidia" },
      { rank: 3, name: "Sony Semiconductor", hq: "🇯🇵 日本", share: "~40% (センサー)", sharePercent: 40, shareNote: "センサー首位", products: "CMOS IMX系 車載イメージセンサー", strategy: "スタックドセンサー・高感度技術", note: "車載カメラ用センサーで圧倒的シェア", companyId: "sony" },
      { rank: 4, name: "Qualcomm", hq: "🇺🇸 米国", share: "~12%", sharePercent: 12, shareNote: "SoC4位", products: "Snapdragon Ride Flex", strategy: "コネクテッド/IVI/ADAS統合SoC", note: "BMW・GM・Stellantisと大型契約", companyId: "qualcomm" },
      { rank: 5, name: "OmniVision Technologies", hq: "🇺🇸 米国(中国系)", share: "~20% (センサー)", sharePercent: 20, shareNote: "センサー2位", products: "車載用CMOSイメージセンサー", strategy: "コスト競争力・中国勢向け採用", note: "Sony対抗でコスト訴求", companyId: null },
    ],
  },
  {
    id: "c15-塗料-コーティング",
    layer: "MATERIAL",
    title: "塗料・コーティング",
    subtitle: "自動車用塗料 (OEM電着・中塗・上塗) / 補修塗料",
    marketSize: "~$18-29B",
    cagr: "4.3-9.7%",
    driver: "水性塗料・低VOC化が規制主導で進展。アジア勢が急台頭",
    summary: "OEM新車塗装と補修塗料市場。PPG・BASF・Axaltaの三強で市場の約40%を占める。ウォーターベース化・低VOC化が規制主導で加速。Nippon Paint・関西ペイントなどアジア勢も存在感を高めている。",
    source: "automotive_supply_chain_v2.xlsx（2024年基準・調査会社推計）",
    players: [
      { rank: 1, name: "PPG Industries", hq: "🇺🇸 米国", share: "~15%", sharePercent: 15, shareNote: "首位", products: "OEM塗料・補修塗料・電着塗料全般", strategy: "BYD協業・中国EV向け特殊効果色", note: "150以上の製造拠点。グローバル最強", companyId: null },
      { rank: 2, name: "BASF Coatings", hq: "🇩🇪 ドイツ", share: "~12%", sharePercent: 12, shareNote: "2位", products: "CathoGuard電着塗料・iGloss系クリア", strategy: "バイオマスバランス対応塗料展開", note: "化学大手のコーティング部門", companyId: null },
      { rank: 3, name: "Axalta Coating Systems", hq: "🇺🇸 米国", share: "~11%", sharePercent: 11, shareNote: "3位", products: "Spies Hecker・Standox補修ブランド", strategy: "デジタルスプレー技術 (Xaar連携)", note: "旧DuPont塗料部門。補修塗料世界有数", companyId: null },
      { rank: 4, name: "AkzoNobel", hq: "🇳🇱 オランダ", share: "~10%", sharePercent: 10, shareNote: "4位", products: "Sikkens・Lesonal補修塗料", strategy: "Autowave Optima 水性ベースコート", note: "関西ペイント欧州事業買収で拡大", companyId: null },
      { rank: 5, name: "Nippon Paint Holdings", hq: "🇯🇵 日本(Wuthelam系)", share: "~8%", sharePercent: 8, shareNote: "5位", products: "OEM塗料・自動車補修アジア首位", strategy: "アジア・中国市場でPPGに対抗", note: "Wuthelam Groupが筆頭株主", companyId: null },
    ],
  },
];

/**
 * 上位3社のシェア合計。寡占度の目安。
 *
 * シェアが1つでも欠けていれば null を返す。欠損を0として足すと
 * 「寡占が緩い」という逆の印象になるため。
 */
export function top3Share(cat: SupplyCategory): number | null {
  const top = cat.players.slice(0, 3).map((p) => p.sharePercent);
  if (top.length < 3) return null;
  let sum = 0;
  for (const v of top) {
    if (v === null) return null;
    sum += v;
  }
  return sum;
}
