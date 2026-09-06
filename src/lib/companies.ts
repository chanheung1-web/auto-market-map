// 自動車バリューチェーンの監視対象マスタ。
//
// 階層(layer)は「完成車に近い側 → 素材・装置側」の順に並ぶ。ai-datacenter-tracker
// の L0〜L7 と同じ考え方だが、自動車は「誰が誰に売るか」より「どの技術転換に
// 賭けているか」で株価が動くため、L2以降は取引段階ではなく技術領域で切っている。
//
// `code` は Yahoo Finance の chart API がそのまま受け付けるシンボル。非上場企業は
// null にする（株価は取りに行かず、地図の集計にも入らないが、業界構造を理解する
// 上で外せないため一覧には残す）。ボッシュ・ZF・現代モービスの一部など、
// 自動車部品の主要プレイヤーには非上場が多い。
//
// このリストは自動更新されない。auto-industry-watcher の data/companies.json とは
// 目的が違う（あちらはニュース収集の監視対象、こちらは株価と地図の母集団）ので、
// 意図的に別管理にしている。重複する14社は同じ企業を指すが、こちらは Yahoo
// シンボルと地域が必須なぶん粒度が細かい。

export type Layer = "OEM" | "TIER1" | "BATTERY" | "SEMI" | "SOFTWARE" | "MATERIAL";

export const LAYER_LABELS: Record<Layer, string> = {
  OEM: "完成車(OEM)",
  TIER1: "部品・メガサプライヤー",
  BATTERY: "電池・EV基幹",
  SEMI: "車載半導体",
  SOFTWARE: "ソフトウェア・自動運転",
  MATERIAL: "素材・製造装置",
};

export const LAYER_ORDER: Layer[] = ["OEM", "TIER1", "BATTERY", "SEMI", "SOFTWARE", "MATERIAL"];

/** 地図上のマーカー単位。個別銘柄はこのいずれかに属する。 */
export type Region = "日本" | "米国" | "欧州" | "中国" | "韓国" | "インド";

export type Company = {
  id: string;
  name: string;
  /** Yahoo Finance シンボル。非上場は null。 */
  code: string | null;
  exchange: string | null;
  region: Region;
  /** 本社所在国。region より細かい表示用（欧州は国が割れるため）。 */
  country: string;
  layer: Layer;
  /** 何をやっている会社か。1行。 */
  position: string;
  // 保有・ウォッチの状態はここに持たない。stock-trading-app の data/*.json を
  // 実行時に読む（src/lib/portfolio.ts）。静的に持っていた時期に実際の保有と
  // 食い違ったため、二重管理をやめた。
};

export const COMPANIES: Company[] = [
  // ── 完成車(OEM) ─────────────────────────────────────────────
  { id: "toyota", name: "トヨタ自動車", code: "7203.T", exchange: "東証P", region: "日本", country: "日本", layer: "OEM", position: "世界最大手。HV主体だがBEVも拡大" },
  { id: "honda", name: "本田技研工業", code: "7267.T", exchange: "東証P", region: "日本", country: "日本", layer: "OEM", position: "二輪の比重が大きく四輪だけでは実態を掴めない" },
  { id: "nissan", name: "日産自動車", code: "7201.T", exchange: "東証P", region: "日本", country: "日本", layer: "OEM", position: "北米・中国の立て直しが継続課題" },
  { id: "suzuki", name: "スズキ", code: "7269.T", exchange: "東証P", region: "日本", country: "日本", layer: "OEM", position: "インド市場のシェアが業績を左右する" },
  { id: "mazda", name: "マツダ", code: "7261.T", exchange: "東証P", region: "日本", country: "日本", layer: "OEM", position: "北米依存度が高く為替感応度が大きい" },
  { id: "subaru", name: "SUBARU", code: "7270.T", exchange: "東証P", region: "日本", country: "日本", layer: "OEM", position: "北米比率が特に高い" },
  { id: "mitsubishi-motors", name: "三菱自動車", code: "7211.T", exchange: "東証P", region: "日本", country: "日本", layer: "OEM", position: "ASEAN市場の比重が大きい" },
  { id: "isuzu", name: "いすゞ自動車", code: "7202.T", exchange: "東証P", region: "日本", country: "日本", layer: "OEM", position: "商用車。ASEAN・アフリカに強い" },
  // 7205.T は Yahoo が 404 を返す（三菱ふそうとの統合に伴い、東証シンボルとしては
  // 引けなくなっている）。代替シンボルも見つからないため、株価なしの構造データ
  // として残す。上場が再開されたら code を戻すこと。
  { id: "hino", name: "日野自動車", code: null, exchange: null, region: "日本", country: "日本", layer: "OEM", position: "商用車。三菱ふそうとの統合。東証シンボルは取得不可" },
  // 以下は非上場だが、収集済みニュースに繰り返し出てくる。株価は無くても
  // 「この会社の話がいま何件あるか」が見えるほうが役に立つので載せる。
  { id: "daihatsu", name: "ダイハツ工業", code: null, exchange: null, region: "日本", country: "日本", layer: "OEM", position: "非上場(トヨタ完全子会社)。軽自動車。トヨタの連結販売台数に含まれる" },
  { id: "fuso", name: "三菱ふそうトラック・バス", code: null, exchange: null, region: "日本", country: "日本", layer: "OEM", position: "非上場(ダイムラー系)。日野との統合が進行" },
  { id: "udtrucks", name: "UDトラックス", code: null, exchange: null, region: "日本", country: "日本", layer: "OEM", position: "非上場(いすゞ傘下)。商用車" },

  { id: "gm", name: "General Motors", code: "GM", exchange: "NYSE", region: "米国", country: "米国", layer: "OEM", position: "北米ピックアップの収益がEV投資を支える構造" },
  { id: "ford", name: "Ford", code: "F", exchange: "NYSE", region: "米国", country: "米国", layer: "OEM", position: "Model e(EV)の赤字幅とPro(商用)の利益が対照的" },
  { id: "tesla", name: "Tesla", code: "TSLA", exchange: "NASDAQ", region: "米国", country: "米国", layer: "OEM", position: "EV専業。FSD・エネルギー事業の比重が増加" },
  { id: "rivian", name: "Rivian", code: "RIVN", exchange: "NASDAQ", region: "米国", country: "米国", layer: "OEM", position: "EV新興。商用バンと量産R2が焦点" },
  { id: "lucid", name: "Lucid", code: "LCID", exchange: "NASDAQ", region: "米国", country: "米国", layer: "OEM", position: "EV新興。高効率パワートレイン技術の外販も" },
  { id: "paccar", name: "PACCAR", code: "PCAR", exchange: "NASDAQ", region: "米国", country: "米国", layer: "OEM", position: "商用車(Kenworth/Peterbilt/DAF)" },

  { id: "vw", name: "Volkswagen", code: "VOW3.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "OEM", position: "欧州最大。中国事業の減速とEV移行コストが論点" },
  { id: "mercedes", name: "Mercedes-Benz", code: "MBG.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "OEM", position: "高価格帯シフト。中国需要の感応度が高い" },
  { id: "bmw", name: "BMW", code: "BMW.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "OEM", position: "Neue Klasse(次世代EV)の立ち上げが焦点" },
  { id: "porsche", name: "Porsche AG", code: "P911.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "OEM", position: "高収益スポーツカー。EV計画は下方修正が続く" },
  { id: "stellantis", name: "Stellantis", code: "STLA", exchange: "NYSE", region: "欧州", country: "オランダ/欧州", layer: "OEM", position: "14ブランド。欧州の値下げ圧力が利益率を圧迫" },
  { id: "renault", name: "Renault", code: "RNO.PA", exchange: "Euronext", region: "欧州", country: "フランス", layer: "OEM", position: "Ampere(EV分社)と日産持分の扱いが論点" },
  { id: "ferrari", name: "Ferrari", code: "RACE", exchange: "NYSE", region: "欧州", country: "イタリア", layer: "OEM", position: "超高収益。景気感応度が他OEMと大きく異なる" },
  { id: "volvo-car", name: "Volvo Cars", code: "VOLCAR-B.ST", exchange: "Nasdaq Stockholm", region: "欧州", country: "スウェーデン", layer: "OEM", position: "吉利傘下。EV専業化の目標を修正済み" },
  { id: "volvo-ab", name: "Volvo AB", code: "VOLV-B.ST", exchange: "Nasdaq Stockholm", region: "欧州", country: "スウェーデン", layer: "OEM", position: "商用車大手。北米トラック市況の先行指標" },

  { id: "byd", name: "BYD", code: "1211.HK", exchange: "HKEX", region: "中国", country: "中国", layer: "OEM", position: "電池内製の垂直統合。NEV世界最大級" },
  { id: "geely", name: "吉利汽車", code: "0175.HK", exchange: "HKEX", region: "中国", country: "中国", layer: "OEM", position: "Volvo Cars・Polestar を傘下に持つ" },
  { id: "greatwall", name: "長城汽車", code: "2333.HK", exchange: "HKEX", region: "中国", country: "中国", layer: "OEM", position: "SUV・ピックアップ主体。輸出比率が上昇" },
  { id: "nio", name: "NIO", code: "NIO", exchange: "NYSE", region: "中国", country: "中国", layer: "OEM", position: "EV新興。バッテリー交換方式が特徴" },
  { id: "xpeng", name: "XPeng", code: "XPEV", exchange: "NYSE", region: "中国", country: "中国", layer: "OEM", position: "EV新興。自動運転の自社開発に注力" },
  { id: "liauto", name: "Li Auto", code: "LI", exchange: "NASDAQ", region: "中国", country: "中国", layer: "OEM", position: "EV新興。EREV(発電機付EV)で先行" },

  { id: "hyundai", name: "現代自動車", code: "005380.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "OEM", position: "E-GMP。米国IRA対応で現地生産を拡大" },
  { id: "kia", name: "起亜", code: "000270.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "OEM", position: "現代グループ。収益性は現代自を上回る局面も" },

  { id: "maruti", name: "Maruti Suzuki", code: "MARUTI.NS", exchange: "NSE", region: "インド", country: "インド", layer: "OEM", position: "インド乗用車最大手。スズキ連結" },
  // Tata Motors は乗用車(TMPV)と商用車(TMCV)に分割済みで、旧 TATAMOTORS.NS は
  // 404 を返す。性格がまるで違う2社なので、平均に効かせるためにも別々に持つ。
  { id: "tatamotors-pv", name: "Tata Motors 乗用車(TMPV)", code: "TMPV.NS", exchange: "NSE", region: "インド", country: "インド", layer: "OEM", position: "JLR(英)を傘下に持ちインドEVでも首位級" },
  { id: "tatamotors-cv", name: "Tata Motors 商用車(TMCV)", code: "TMCV.NS", exchange: "NSE", region: "インド", country: "インド", layer: "OEM", position: "インド商用車最大手" },
  { id: "mahindra", name: "Mahindra & Mahindra", code: "M&M.NS", exchange: "NSE", region: "インド", country: "インド", layer: "OEM", position: "SUV・トラクター。インドSUV市場で存在感" },

  // ── 部品・メガサプライヤー ──────────────────────────────────
  { id: "denso", name: "デンソー", code: "6902.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "世界2位級。OEM各社の生産計画の先行指標になる" },
  { id: "aisin", name: "アイシン", code: "7259.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "AT・eAxle。トヨタ系の中核" },
  // 6201.T は 404。米OTCのADR(TYIDY)なら引けるため、そちらを使う。
  // 値は米ドル建てのADR価格で、東証の株価そのものではない。騰落率も為替を含む。
  { id: "toyota-industries", name: "豊田自動織機(ADR)", code: "TYIDY", exchange: "OTC(ADR)", region: "日本", country: "日本", layer: "TIER1", position: "産業車両・カーエアコン用コンプレッサ。ADR建てのため為替の影響を含む" },
  { id: "toyoda-gosei", name: "豊田合成", code: "7282.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "樹脂部品・エアバッグ" },
  { id: "jtekt", name: "ジェイテクト", code: "6473.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "ステアリング・軸受" },
  { id: "koito", name: "小糸製作所", code: "7276.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "自動車照明で世界首位級。LiDAR搭載も" },
  { id: "sumitomo-electric", name: "住友電気工業", code: "5802.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "ワイヤーハーネス世界首位級" },
  { id: "yazaki", name: "矢崎総業", code: null, exchange: null, region: "日本", country: "日本", layer: "TIER1", position: "非上場。ワイヤーハーネス世界首位級" },
  { id: "bridgestone", name: "ブリヂストン", code: "5108.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "タイヤ世界首位級。補修需要で景気耐性がある" },
  { id: "nidec", name: "ニデック", code: "6594.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "車載モーター(e-Axle)。中国EV向けの価格競争が論点" },
  { id: "yokohama-rubber", name: "横浜ゴム", code: "5101.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "タイヤ。オフハイウェイ(農建機)比率を高めている" },
  { id: "toyo-tire", name: "TOYO TIRE", code: "5105.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "タイヤ。北米ピックアップ・SUV向けの比重が大きい" },
  { id: "toyota-boshoku", name: "トヨタ紡織", code: "3116.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "シート・内装。トヨタ系" },
  { id: "ts-tech", name: "テイ・エス テック", code: "7313.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "シート。ホンダ系で二輪シートも" },
  { id: "tokai-rika", name: "東海理化", code: "6995.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "スイッチ・シフト・スマートキー" },
  { id: "nok", name: "NOK", code: "7240.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "オイルシール世界首位級。FPC(電子部品)も持つ" },
  { id: "exedy", name: "エクセディ", code: "7278.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "クラッチ・トルコン。電動化で構造転換を迫られる側" },
  { id: "musashi", name: "武蔵精密工業", code: "7220.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "ギア・デフ。ホンダ系" },
  { id: "futaba", name: "フタバ産業", code: "7241.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "排気系・車体プレス。トヨタ系" },
  { id: "stanley", name: "スタンレー電気", code: "6923.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "自動車照明。小糸に次ぐ国内2位級" },
  { id: "niterra", name: "ニテラ(日本特殊陶業)", code: "5334.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "点火プラグ・排気センサ。内燃機関依存からの転換が論点" },
  { id: "daido-metal", name: "大同メタル工業", code: "7245.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "すべり軸受。エンジン部品の比重が高い" },
  { id: "topy", name: "トピー工業", code: "7231.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "自動車用ホイール・鋼材" },

  { id: "aptiv", name: "Aptiv", code: "APTV", exchange: "NYSE", region: "米国", country: "アイルランド/米国", layer: "TIER1", position: "電装アーキテクチャ。SDV配線の集約で中心的" },
  { id: "borgwarner", name: "BorgWarner", code: "BWA", exchange: "NYSE", region: "米国", country: "米国", layer: "TIER1", position: "パワートレイン。内燃機関からEV部品へ転換中" },
  { id: "lear", name: "Lear", code: "LEA", exchange: "NYSE", region: "米国", country: "米国", layer: "TIER1", position: "シート・電装システム" },
  { id: "magna", name: "Magna International", code: "MGA", exchange: "NYSE", region: "米国", country: "カナダ", layer: "TIER1", position: "受託生産もこなす総合サプライヤー" },

  { id: "bosch", name: "Robert Bosch", code: null, exchange: null, region: "欧州", country: "ドイツ", layer: "TIER1", position: "非上場。世界最大の自動車部品メーカー" },
  { id: "zf", name: "ZF Friedrichshafen", code: null, exchange: null, region: "欧州", country: "ドイツ", layer: "TIER1", position: "非上場。駆動・シャシー。財務負担が重い" },
  { id: "continental", name: "Continental", code: "CON.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "TIER1", position: "タイヤと車載電子。事業分割を進めている" },
  { id: "forvia", name: "Forvia", code: "FRVIA.PA", exchange: "Euronext", region: "欧州", country: "フランス", layer: "TIER1", position: "内装・排気(旧Faurecia+HELLA)" },
  { id: "valeo", name: "Valeo", code: "FR.PA", exchange: "Euronext", region: "欧州", country: "フランス", layer: "TIER1", position: "ADAS用センサー・電動化" },
  { id: "michelin", name: "Michelin", code: "ML.PA", exchange: "Euronext", region: "欧州", country: "フランス", layer: "TIER1", position: "タイヤ大手" },
  { id: "autoliv", name: "Autoliv", code: "ALV", exchange: "NYSE", region: "欧州", country: "スウェーデン", layer: "TIER1", position: "エアバッグ・シートベルト世界首位" },

  { id: "hyundai-mobis", name: "現代モービス", code: "012330.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "TIER1", position: "現代グループの部品中核" },
  { id: "huayu", name: "華域汽車", code: "600741.SS", exchange: "SSE", region: "中国", country: "中国", layer: "TIER1", position: "上汽系の総合部品" },
  { id: "fuyao", name: "福耀ガラス", code: "3606.HK", exchange: "HKEX", region: "中国", country: "中国", layer: "TIER1", position: "自動車ガラス世界首位級" },
  { id: "samvardhana", name: "Samvardhana Motherson", code: "MOTHERSON.NS", exchange: "NSE", region: "インド", country: "インド", layer: "TIER1", position: "ワイヤーハーネス・ミラー。買収で世界展開" },

  // ── 電池・EV基幹 ────────────────────────────────────────────
  { id: "panasonic", name: "パナソニックHD", code: "6752.T", exchange: "東証P", region: "日本", country: "日本", layer: "BATTERY", position: "車載電池。Tesla向けの比重が大きい" },
  { id: "gsyuasa", name: "GSユアサ", code: "6674.T", exchange: "東証P", region: "日本", country: "日本", layer: "BATTERY", position: "鉛・リチウム電池。ホンダとの合弁" },
  { id: "catl", name: "CATL(寧徳時代)", code: "300750.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "BATTERY", position: "車載電池世界首位。LFPで価格主導権を握る" },
  { id: "eve", name: "億緯鋰能(EVE)", code: "300014.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "BATTERY", position: "車載・蓄電池。大型円筒でも展開" },
  { id: "lges", name: "LGエナジーソリューション", code: "373220.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "BATTERY", position: "車載電池。北米でOEMとの合弁が多い" },
  { id: "samsung-sdi", name: "サムスンSDI", code: "006400.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "BATTERY", position: "車載電池。角形・全固体の開発で先行" },
  { id: "skon", name: "SK On", code: null, exchange: null, region: "韓国", country: "韓国", layer: "BATTERY", position: "非上場(SKイノベーション傘下)。車載電池" },
  { id: "ppes", name: "プライムプラネットエナジー&ソリューションズ", code: null, exchange: null, region: "日本", country: "日本", layer: "BATTERY", position: "非上場(トヨタ・パナソニック合弁)。車載電池" },
  { id: "quantumscape", name: "QuantumScape", code: "QS", exchange: "NYSE", region: "米国", country: "米国", layer: "BATTERY", position: "全固体電池。VWと提携。量産前の研究開発段階" },

  // ── 車載半導体 ──────────────────────────────────────────────
  { id: "renesas", name: "ルネサスエレクトロニクス", code: "6723.T", exchange: "東証P", region: "日本", country: "日本", layer: "SEMI", position: "車載MCU世界首位級。OEMの在庫調整に直撃される" },
  { id: "rohm", name: "ローム", code: "6963.T", exchange: "東証P", region: "日本", country: "日本", layer: "SEMI", position: "SiCパワー半導体。EV向け投資が先行している" },
  { id: "mitsubishi-electric", name: "三菱電機", code: "6503.T", exchange: "東証P", region: "日本", country: "日本", layer: "SEMI", position: "パワー半導体と車載機器の両方を持つ" },
  { id: "murata", name: "村田製作所", code: "6981.T", exchange: "東証P", region: "日本", country: "日本", layer: "SEMI", position: "MLCC。EV1台あたりの搭載数が内燃機関車より多い" },
  { id: "sanken", name: "サンケン電気", code: "6707.T", exchange: "東証P", region: "日本", country: "日本", layer: "SEMI", position: "パワー半導体。車載向けの比重を高めている" },
  { id: "tdk", name: "TDK", code: "6762.T", exchange: "東証P", region: "日本", country: "日本", layer: "SEMI", position: "受動部品・磁気センサ。車載用電池(小型)も" },
  { id: "kyocera", name: "京セラ", code: "6971.T", exchange: "東証P", region: "日本", country: "日本", layer: "SEMI", position: "電子部品・パッケージ。車載カメラ関連も" },
  { id: "infineon", name: "Infineon", code: "IFX.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "SEMI", position: "車載パワー半導体で世界首位" },
  { id: "nxp", name: "NXP Semiconductors", code: "NXPI", exchange: "NASDAQ", region: "欧州", country: "オランダ", layer: "SEMI", position: "車載プロセッサ・ネットワーク" },
  { id: "st", name: "STMicroelectronics", code: "STM", exchange: "NYSE", region: "欧州", country: "スイス/仏伊", layer: "SEMI", position: "SiC。Tesla向けの比重が大きい" },
  { id: "onsemi", name: "onsemi", code: "ON", exchange: "NASDAQ", region: "米国", country: "米国", layer: "SEMI", position: "SiC・イメージセンサ" },
  { id: "ti", name: "Texas Instruments", code: "TXN", exchange: "NASDAQ", region: "米国", country: "米国", layer: "SEMI", position: "アナログ。車載比率が高く在庫循環の指標になる" },
  { id: "adi", name: "Analog Devices", code: "ADI", exchange: "NASDAQ", region: "米国", country: "米国", layer: "SEMI", position: "アナログ。車載BMS・車内ネットワーク" },
  { id: "microchip", name: "Microchip", code: "MCHP", exchange: "NASDAQ", region: "米国", country: "米国", layer: "SEMI", position: "MCU。車載在庫調整の影響を強く受ける" },
  { id: "nexperia", name: "Nexperia", code: null, exchange: null, region: "欧州", country: "オランダ", layer: "SEMI", position: "非上場。ディスクリート。供給問題が減産に直結した実績あり" },

  // ── ソフトウェア・自動運転 ─────────────────────────────────
  { id: "nvidia", name: "NVIDIA", code: "NVDA", exchange: "NASDAQ", region: "米国", country: "米国", layer: "SOFTWARE", position: "DRIVE。車載は全社売上比では小さいが影響力が大きい" },
  { id: "qualcomm", name: "Qualcomm", code: "QCOM", exchange: "NASDAQ", region: "米国", country: "米国", layer: "SOFTWARE", position: "Snapdragon Digital Chassis。コックピットで採用が拡大" },
  { id: "mobileye", name: "Mobileye", code: "MBLY", exchange: "NASDAQ", region: "米国", country: "イスラエル/米国", layer: "SOFTWARE", position: "ADAS。Intel傘下。受注残の推移が論点" },
  { id: "luminar", name: "Luminar", code: "LAZR", exchange: "NASDAQ", region: "米国", country: "米国", layer: "SOFTWARE", position: "LiDAR。量産採用の獲得が経営継続の前提" },
  { id: "innoviz", name: "Innoviz", code: "INVZ", exchange: "NASDAQ", region: "米国", country: "イスラエル", layer: "SOFTWARE", position: "LiDAR。BMW等との量産プログラム" },
  { id: "hesai", name: "Hesai(禾賽科技)", code: "HSAI", exchange: "NASDAQ", region: "中国", country: "中国", layer: "SOFTWARE", position: "LiDAR出荷数量で世界首位級。価格低下が速い" },
  { id: "horizon-robotics", name: "Horizon Robotics(地平線)", code: "9660.HK", exchange: "HKEX", region: "中国", country: "中国", layer: "SOFTWARE", position: "車載AIチップ。中国OEMでの採用が広い" },
  { id: "elektrobit", name: "Elektrobit", code: null, exchange: null, region: "欧州", country: "ドイツ", layer: "SOFTWARE", position: "非上場(Continental傘下)。車載基盤ソフト" },

  // 日本のSDV/自動運転は自動車専業ではなく総合電機・IT側が担っている。
  // 「自動車株」で探すと漏れるが、車載が伸びれば効いてくる企業をここに置く。
  // 売上に占める車載比率は各社まちまちなので、株価の動きをそのまま
  // 自動車要因と読まないこと。
  { id: "hitachi", name: "日立製作所", code: "6501.T", exchange: "東証P", region: "日本", country: "日本", layer: "SOFTWARE", position: "日立Astemo(車載)とSDV基盤。全社に占める車載比率は限定的" },
  { id: "sony", name: "ソニーグループ", code: "6758.T", exchange: "東証P", region: "日本", country: "日本", layer: "SOFTWARE", position: "車載イメージセンサ首位級。ソニー・ホンダモビリティも" },
  { id: "fujitsu", name: "富士通", code: "6702.T", exchange: "東証P", region: "日本", country: "日本", layer: "SOFTWARE", position: "車載向けソフト・MaaS基盤" },
  { id: "nec", name: "NEC", code: "6701.T", exchange: "東証P", region: "日本", country: "日本", layer: "SOFTWARE", position: "車載ソフト・V2X。生体認証を車載に展開" },
  { id: "pksha", name: "PKSHA Technology", code: "3993.T", exchange: "東証P", region: "日本", country: "日本", layer: "SOFTWARE", position: "AIアルゴリズム。自動運転向けの提供実績がある" },
  { id: "tier4", name: "ティアフォー", code: null, exchange: null, region: "日本", country: "日本", layer: "SOFTWARE", position: "非上場。自動運転OSS(Autoware)の中心。国産エッジAI半導体にも参画" },
  // 6773.T は 404（2019年に上場廃止）。ニュースには繰り返し出るため残す。
  { id: "pioneer", name: "パイオニア", code: null, exchange: null, region: "日本", country: "日本", layer: "TIER1", position: "非上場。車載ナビ・IVI。BtoC撤退しOEM供給へ集中" },

  // ── 素材・製造装置 ──────────────────────────────────────────
  { id: "nipponsteel", name: "日本製鉄", code: "5401.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "自動車向け高張力鋼板。OEMの生産計画が業績に波及" },
  { id: "kobe-steel", name: "神戸製鋼所", code: "5406.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "アルミ・鋼材。車体軽量化で採用が広がる" },
  { id: "toray", name: "東レ", code: "3402.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "炭素繊維。電池セパレータも" },
  { id: "asahi-kasei", name: "旭化成", code: "3407.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "電池セパレータで世界首位級" },
  { id: "sumitomo-metal-mining", name: "住友金属鉱山", code: "5713.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "電池正極材。ニッケル権益も持つ" },
  { id: "agc", name: "AGC", code: "5201.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "自動車ガラス。ヘッドアップディスプレイ対応品も" },
  { id: "sekisui-chemical", name: "積水化学工業", code: "4204.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "合わせガラス用中間膜で世界首位級" },
  { id: "mitsui-chemicals", name: "三井化学", code: "4183.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "自動車用樹脂・エラストマー" },
  { id: "dowa", name: "DOWAホールディングス", code: "5714.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "触媒用貴金属リサイクル・車載向け電子材料" },
  { id: "albemarle", name: "Albemarle", code: "ALB", exchange: "NYSE", region: "米国", country: "米国", layer: "MATERIAL", position: "リチウム。EV需要の減速がそのまま市況に出る" },
  { id: "posco-future-m", name: "POSCO Future M", code: "003670.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "MATERIAL", position: "正極・負極材" },
  { id: "ganfeng", name: "贛鋒鋰業", code: "1772.HK", exchange: "HKEX", region: "中国", country: "中国", layer: "MATERIAL", position: "リチウム大手" },
  { id: "arcelormittal", name: "ArcelorMittal", code: "MT", exchange: "NYSE", region: "欧州", country: "ルクセンブルク", layer: "MATERIAL", position: "鉄鋼。欧州OEM向け鋼材" },

  // ── サプライチェーンの上位プレイヤーとして追加した企業 ────────────
  // 各分野のランキングに出てくるのに株価を追えていなかったぶん。
  // 親会社で代用しているものは社名を親会社名にしてある（子会社名で親の株価を
  // 出すと別物を見ることになるため）。
  { id: "posco", name: "POSCO Holdings", code: "005490.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "MATERIAL", position: "鉄鋼大手。自動車用鋼板でHyundai向けに強い" },
  { id: "thyssenkrupp", name: "ThyssenKrupp", code: "TKA.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "MATERIAL", position: "鉄鋼・プレス成形用高張力鋼" },
  { id: "ssab", name: "SSAB", code: "SSAB-B.ST", exchange: "Nasdaq Stockholm", region: "欧州", country: "スウェーデン", layer: "MATERIAL", position: "高強度鋼。CO2フリー鋼材(HYBRIT)で先行" },
  { id: "norsk-hydro", name: "Norsk Hydro", code: "NHY.OL", exchange: "Oslo", region: "欧州", country: "ノルウェー", layer: "MATERIAL", position: "アルミ一貫。低炭素アルミで欧州OEM向け" },
  { id: "constellium", name: "Constellium", code: "CSTM", exchange: "NYSE", region: "欧州", country: "フランス/米国", layer: "MATERIAL", position: "自動車用アルミ板・押出材" },
  { id: "uacj", name: "UACJ", code: "5741.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "アルミ圧延。熱交換器材・車体パネル材" },
  { id: "hindalco", name: "Hindalco (Novelis親会社)", code: "HINDALCO.NS", exchange: "NSE", region: "インド", country: "インド", layer: "MATERIAL", position: "アルミ。子会社Novelisが自動車用板材で世界首位級" },
  { id: "basf", name: "BASF", code: "BAS.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "MATERIAL", position: "化学最大手。自動車用樹脂・塗料・触媒を横断" },
  { id: "covestro", name: "Covestro", code: "1COV.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "MATERIAL", position: "ポリウレタン・ポリカーボネート" },
  { id: "lyondellbasell", name: "LyondellBasell", code: "LYB", exchange: "NYSE", region: "欧州", country: "オランダ/米国", layer: "MATERIAL", position: "ポリプロピレン。バンパー・内装樹脂の主原料" },
  { id: "dupont", name: "DuPont", code: "DD", exchange: "NYSE", region: "米国", country: "米国", layer: "MATERIAL", position: "エンジニアリングプラスチック(Zytel等)" },
  { id: "sabic", name: "SABIC", code: "2010.SR", exchange: "Tadawul", region: "欧州", country: "サウジアラビア", layer: "MATERIAL", position: "石化大手。自動車用樹脂。Saudi Aramco系" },
  { id: "ppg", name: "PPG Industries", code: "PPG", exchange: "NYSE", region: "米国", country: "米国", layer: "MATERIAL", position: "自動車用塗料で世界首位級" },
  { id: "axalta", name: "Axalta Coating Systems", code: "AXTA", exchange: "NYSE", region: "米国", country: "米国", layer: "MATERIAL", position: "自動車塗料専業。補修塗料に強い" },
  { id: "akzonobel", name: "AkzoNobel", code: "AKZA.AS", exchange: "Euronext", region: "欧州", country: "オランダ", layer: "MATERIAL", position: "塗料大手。自動車補修が主力" },
  { id: "nippon-paint", name: "日本ペイントHD", code: "4612.T", exchange: "東証P", region: "日本", country: "日本", layer: "MATERIAL", position: "塗料大手。自動車用は日系OEM向けが中心" },
  { id: "umicore", name: "Umicore", code: "UMI.BR", exchange: "Euronext", region: "欧州", country: "ベルギー", layer: "MATERIAL", position: "三元系正極材と触媒。リサイクルと一体運用" },
  { id: "hunan-yuneng", name: "湖南裕能", code: "301358.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "MATERIAL", position: "LFP正極材で世界首位。CATL・BYD向け" },
  { id: "hubei-wanrun", name: "湖北万潤", code: "002643.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "MATERIAL", position: "LFP正極材2位" },
  { id: "dynanonic", name: "徳方納米(Dynanonic)", code: "300769.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "MATERIAL", position: "LFP正極材3位" },
  { id: "sqm", name: "SQM", code: "SQM", exchange: "NYSE", region: "米国", country: "チリ", layer: "MATERIAL", position: "アタカマ塩湖のリチウム。低コスト生産" },
  { id: "tianqi", name: "天斉鋰業(Tianqi)", code: "002466.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "MATERIAL", position: "リチウム化合物。Greenbushesに出資" },
  { id: "adient", name: "Adient", code: "ADNT", exchange: "NYSE", region: "米国", country: "アイルランド/米国", layer: "TIER1", position: "自動車シートで世界首位級" },
  { id: "yanfeng-hasco", name: "Yanfeng(華域汽車傘下)", code: "600741.SS", exchange: "SSE", region: "中国", country: "中国", layer: "TIER1", position: "内装で世界首位級。上場体は親会社の華域汽車" },
  { id: "gestamp", name: "Gestamp", code: "GEST.MC", exchange: "BME", region: "欧州", country: "スペイン", layer: "TIER1", position: "車体プレス・シャシー部品" },
  { id: "kyb", name: "KYB", code: "7242.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "ショックアブソーバー。油圧機器も" },
  { id: "goodyear", name: "Goodyear", code: "GT", exchange: "NASDAQ", region: "米国", country: "米国", layer: "TIER1", position: "タイヤ大手。北米比率が高い" },
  { id: "pirelli", name: "Pirelli", code: "PIRC.MI", exchange: "Borsa Italiana", region: "欧州", country: "イタリア", layer: "TIER1", position: "高性能タイヤに特化。中国中化が大株主" },
  { id: "cooper-standard", name: "Cooper Standard", code: "CPS", exchange: "NYSE", region: "米国", country: "米国", layer: "TIER1", position: "ウェザーストリップで世界首位" },
  { id: "nishikawa-rubber", name: "西川ゴム工業", code: "5161.T", exchange: "東証S", region: "日本", country: "日本", layer: "TIER1", position: "ウェザーストリップ。マツダ系" },
  { id: "nsg", name: "NSG(日本板硝子)", code: "5202.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "自動車ガラス。Pilkingtonブランド" },
  { id: "saint-gobain", name: "Saint-Gobain", code: "SGO.PA", exchange: "Euronext", region: "欧州", country: "フランス", layer: "TIER1", position: "建材大手。Sekuritブランドで自動車ガラス" },
  { id: "furukawa-electric", name: "古河電気工業", code: "5801.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "自動車電線・ハーネス。光通信技術も" },
  { id: "visteon", name: "Visteon", code: "VC", exchange: "NASDAQ", region: "米国", country: "米国", layer: "TIER1", position: "コックピット電子・ディスプレイ" },
  { id: "joyson", name: "均勝電子(Joyson)", code: "600699.SS", exchange: "SSE", region: "中国", country: "中国", layer: "TIER1", position: "エアバッグ・シートベルト。タカタの事業を承継" },
  { id: "daicel", name: "ダイセル", code: "4202.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "エアバッグ用インフレータで首位級。化学が本業" },
  { id: "calb", name: "CALB(中創新航)", code: "3931.HK", exchange: "HKEX", region: "中国", country: "中国", layer: "BATTERY", position: "車載電池4位。中国OEMの第2調達先" },
  { id: "gotion", name: "国軒高科(Gotion)", code: "002074.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "BATTERY", position: "LFP電池。VWが出資し欧州展開" },
  { id: "wolfspeed", name: "Wolfspeed", code: "WOLF", exchange: "NYSE", region: "米国", country: "米国", layer: "SEMI", position: "SiC基板で世界最大。8インチで先行" },
  { id: "will-semi", name: "韋爾股份(OmniVision親会社)", code: "603501.SS", exchange: "SSE", region: "中国", country: "中国", layer: "SOFTWARE", position: "車載イメージセンサ2位のOmniVisionを傘下に持つ" },

  // ── 新設カテゴリ（ブレーキ・熱マネジメント・排気/触媒）ぶん ────────
  { id: "brembo", name: "Brembo", code: "BRE.MI", exchange: "Borsa Italiana", region: "欧州", country: "イタリア", layer: "TIER1", position: "高性能ブレーキ。キャリパーで世界首位" },
  { id: "knorr-bremse", name: "Knorr-Bremse", code: "KBX.DE", exchange: "XETRA", region: "欧州", country: "ドイツ", layer: "TIER1", position: "商用車・鉄道ブレーキで世界首位級" },
  { id: "hl-mando", name: "HL Mando", code: "204320.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "TIER1", position: "ブレーキ・ステアリング。現代系だが外販も" },
  { id: "akebono", name: "曙ブレーキ工業", code: "7238.T", exchange: "東証P", region: "日本", country: "日本", layer: "TIER1", position: "ブレーキ摩擦材・キャリパー。トヨタ系" },
  { id: "hanon", name: "Hanon Systems", code: "018880.KS", exchange: "KRX", region: "韓国", country: "韓国", layer: "TIER1", position: "熱マネジメント専業。EV向けヒートポンプに強い" },
  { id: "modine", name: "Modine Manufacturing", code: "MOD", exchange: "NYSE", region: "米国", country: "米国", layer: "TIER1", position: "熱交換器。データセンター冷却でも伸長" },
  { id: "mahle", name: "MAHLE", code: null, exchange: null, region: "欧州", country: "ドイツ", layer: "TIER1", position: "非上場(財団所有)。熱マネジメント・ピストン" },
  { id: "johnson-matthey", name: "Johnson Matthey", code: "JMAT.L", exchange: "LSE", region: "欧州", country: "英国", layer: "TIER1", position: "排ガス触媒で世界首位級。白金族の精製も" },
  { id: "eberspaecher", name: "Eberspächer", code: null, exchange: null, region: "欧州", country: "ドイツ", layer: "TIER1", position: "非上場。排気系・車載ヒーター" },
  { id: "cataler", name: "キャタラー", code: null, exchange: null, region: "日本", country: "日本", layer: "TIER1", position: "非上場(トヨタ系)。排ガス触媒・燃料電池触媒" },

  // ── EV熱マネジメントの中国勢 ──────────────────────────────
  { id: "sanhua", name: "三花智控(Sanhua)", code: "002050.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "TIER1", position: "電子膨張弁で世界首位。Teslaの最大の外部熱マネジメント供給元" },
  { id: "yinlun", name: "銀輪股份(Yinlun)", code: "002126.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "TIER1", position: "熱交換器。商用車から車載EVへ展開" },
  { id: "aotecar", name: "奥特佳(Aotecar)", code: "002239.SZ", exchange: "SZSE", region: "中国", country: "中国", layer: "TIER1", position: "車載用電動コンプレッサ" },
];

/** 株価を取りに行ける（上場している）企業だけを返す。 */
export function listedCompanies(): Company[] {
  return COMPANIES.filter((c) => c.code !== null);
}

export function companiesByLayer(layer: Layer): Company[] {
  return COMPANIES.filter((c) => c.layer === layer);
}
