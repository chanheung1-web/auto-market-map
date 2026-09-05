import type { SupplyCategory } from "./supplyChain";

// Excel（automotive_supply_chain_v2.xlsx）に無かった分野を、個別に調べて足したもの。
//
// **元Excelとは出どころも時点も違う**ので別ファイルにしてある。混ぜると
// 「2024年基準の調査会社推計」という但し書きが実態と合わなくなる。
// 各カテゴリの `source` に調査元と時点を書くこと。
//
// Excel が電池・完成車・照明・安全部品を持っていなかったのは、あの資料が
// 「部品カテゴリのシェアマップ」として作られていて、完成車と電池セルは
// 別立ての扱いだったためと思われる。ここで埋めている。

export const EXTRA_CATEGORIES: SupplyCategory[] = [
  {
    id: "x-safety",
    layer: "TIER1",
    title: "安全部品",
    subtitle: "エアバッグ・シートベルト・インフレータ",
    marketSize: "~$60B（2025・エアバッグ＋シートベルト）",
    cagr: "約5%",
    driver: "側面・カーテンエアバッグの標準化と、後席シートベルト規制の強化",
    summary:
      "Autolivが4割超を握る寡占市場。上位5社（Autoliv・Daicel・ZF・Joyson Safety・豊田合成）で約83%、インフレータまで含めた上位7社では約88%に達する。参入障壁は認証と品質責任の重さで、タカタの破綻後は供給者がさらに絞られた。日系はインフレータ（ダイセル・日本化薬）と樹脂部品（豊田合成）で強い。",
    source: "各社発表・業界レポート（2025年時点の推計）。個別シェアは上位5社合計83%からの按分を含むため確度は中",
    players: [
      { rank: 1, name: "Autoliv", hq: "🇸🇪 スウェーデン", share: "~43%", sharePercent: 43, shareNote: "絶対首位", products: "エアバッグ・シートベルト・ステアリングホイール", strategy: "全方位のOEM対応と認証実績", note: "エアバッグ・シートベルトの世界首位", companyId: "autoliv" },
      { rank: 2, name: "ZF (旧TRW)", hq: "🇩🇪 ドイツ", share: "~15%", sharePercent: 15, shareNote: "2位", products: "エアバッグ・シートベルト・乗員検知", strategy: "シャシー・ADASと束ねた提案", note: "TRW買収で安全部品に参入。非上場", companyId: "zf" },
      { rank: 3, name: "Joyson Safety Systems", hq: "🇨🇳 中国/🇩🇪", share: "~13%", sharePercent: 13, shareNote: "3位", products: "エアバッグ・シートベルト", strategy: "タカタの事業を承継し規模を確保", note: "均勝電子(Joyson)傘下。非上場", companyId: null },
      { rank: 4, name: "Daicel (ダイセル)", hq: "🇯🇵 日本", share: "~7%", sharePercent: 7, shareNote: "インフレータ首位級", products: "エアバッグ用インフレータ", strategy: "火工品技術。完成品ではなく基幹部品に特化", note: "4202.T。監視対象外", companyId: null },
      { rank: 5, name: "豊田合成", hq: "🇯🇵 日本", share: "~5%", sharePercent: 5, shareNote: "5位", products: "エアバッグ（樹脂・縫製）", strategy: "トヨタ系。樹脂成形の内製と一体運用", note: "シール分野でも上位（重複掲載）", companyId: "toyoda-gosei" },
    ],
  },
  {
    id: "x-battery-cell",
    layer: "BATTERY",
    title: "車載電池セル",
    subtitle: "EV用リチウムイオン電池セル・モジュール",
    marketSize: "2025年の世界EV電池搭載量ベース",
    cagr: "—",
    driver: "LFPの比率上昇と、中国勢の海外生産移転",
    summary:
      "CATLとBYDの2社だけで搭載量の55.6%を占める。中国勢が合計で約69%を握り、日韓勢は合計でも2割に届かない。BYDは自社EV向けの内製が主体なので、外販市場での競争はCATL対日韓という構図になる。パナソニックはTesla向けの比重が高く、Teslaの調達方針の変化がそのまま効く。",
    source: "SNE Research 2025年通年（EV搭載量ベース）",
    players: [
      { rank: 1, name: "CATL(寧徳時代)", hq: "🇨🇳 中国", share: "39.2%", sharePercent: 39.2, shareNote: "絶対首位", products: "LFP・三元系セル、CTP構造", strategy: "LFPの量産で価格主導権", note: "外販主体。欧州にも生産拠点", companyId: "catl" },
      { rank: 2, name: "BYD", hq: "🇨🇳 中国", share: "16.4%", sharePercent: 16.4, shareNote: "2位", products: "ブレードバッテリー(LFP)", strategy: "自社EVへの内製で垂直統合", note: "外販は限定的", companyId: "byd" },
      { rank: 3, name: "LGエナジーソリューション", hq: "🇰🇷 韓国", share: "9.2%", sharePercent: 9.2, shareNote: "非中国で首位", products: "パウチ型三元系", strategy: "北米でOEMとの合弁を多数展開", note: "2025年の搭載量108.8GWh（前年比+11.3%）", companyId: "lges" },
      { rank: 4, name: "CALB(中創新航)", hq: "🇨🇳 中国", share: "5.3%", sharePercent: 5.3, shareNote: "4位", products: "三元系・LFP", strategy: "中国OEM向けの第2調達先", note: "監視対象外", companyId: null },
      { rank: 5, name: "Gotion High-tech(国軒高科)", hq: "🇨🇳 中国", share: "4.5%", sharePercent: 4.5, shareNote: "5位", products: "LFP", strategy: "VWが出資。欧州展開", note: "監視対象外", companyId: null },
      { rank: 6, name: "SK On", hq: "🇰🇷 韓国", share: "3.7%", sharePercent: 3.7, shareNote: "6位", products: "パウチ型三元系", strategy: "北米でFord等と合弁", note: "非上場(SKイノベーション傘下)", companyId: "skon" },
      { rank: 7, name: "パナソニックHD", hq: "🇯🇵 日本", share: "3.7%", sharePercent: 3.7, shareNote: "7位", products: "円筒形(2170/4680)", strategy: "Tesla向けの長期供給", note: "Tesla依存度が高い", companyId: "panasonic" },
      { rank: 8, name: "億緯鋰能(EVE)", hq: "🇨🇳 中国", share: "2.6%", sharePercent: 2.6, shareNote: "8位", products: "大型円筒・LFP", strategy: "蓄電池と両輪", note: "", companyId: "eve" },
      { rank: 9, name: "サムスンSDI", hq: "🇰🇷 韓国", share: "2.4%", sharePercent: 2.4, shareNote: "9位", products: "角形三元系", strategy: "高付加価値帯に集中。全固体を開発中", note: "", companyId: "samsung-sdi" },
    ],
  },
  {
    id: "x-cathode-anode",
    layer: "MATERIAL",
    title: "正極材・負極材",
    subtitle: "カソード（NCM/LFP）・アノード（黒鉛・シリコン）",
    marketSize: "正極材 2025年出荷 495万トン（うちLFPが347万トン＝約72%）",
    cagr: "—",
    driver: "LFPシフトと、中国外サプライチェーンの構築要求",
    summary:
      "**中国勢が圧倒的**で、負極材は世界の8割超が中国製。正極材もLFPが数量の72%を占め、上位は湖南裕能・湖北万潤・徳方納米といった中国LFPメーカーが並ぶ。日韓勢は三元系の高ニッケル帯に絞って戦っており、数量シェアでは上位に出てこない。POSCO Future Mは正極・負極の両方を手がける数少ない非中国企業だが、負極材シェアは世界11位・1.3%にとどまる。",
    source: "SNE Research 2025年出荷量、Umicore開示（2024）、POSCO Future M 開示。数量ベースのため金額シェアとは異なる",
    players: [
      { rank: 1, name: "湖南裕能(Hunan Yuneng)", hq: "🇨🇳 中国", share: "114万トン", sharePercent: 23, shareNote: "LFP首位", products: "LFP正極材", strategy: "CATL・BYD向けの大量供給", note: "監視対象外", companyId: null },
      { rank: 2, name: "湖北万潤(Hubei Wanrun)", hq: "🇨🇳 中国", share: "37.5万トン", sharePercent: 7.6, shareNote: "2位", products: "LFP正極材", strategy: "—", note: "監視対象外", companyId: null },
      { rank: 3, name: "徳方納米(Dynanonic)", hq: "🇨🇳 中国", share: "28万トン", sharePercent: 5.7, shareNote: "3位", products: "LFP正極材", strategy: "—", note: "監視対象外", companyId: null },
      { rank: 4, name: "Umicore", hq: "🇧🇪 ベルギー", share: "~11.5%", sharePercent: 11.5, shareNote: "非中国で最大級", products: "三元系正極材", strategy: "欧州OEM向け。リサイクルと一体運用", note: "2024年時点のシェア。監視対象外", companyId: null },
      { rank: 5, name: "住友金属鉱山", hq: "🇯🇵 日本", share: "非開示", sharePercent: null, shareNote: "高ニッケル帯", products: "NCA/NCM正極材", strategy: "ニッケル権益から一貫。パナソニック向け", note: "数量では中国勢に及ばないが高ニッケル帯で存在感", companyId: "sumitomo-metal-mining" },
      { rank: 6, name: "POSCO Future M", hq: "🇰🇷 韓国", share: "負極 ~1.3%", sharePercent: 1.3, shareNote: "負極で世界11位", products: "正極材・負極材（天然/人造黒鉛）", strategy: "正極と負極の両方を持つ数少ない非中国企業。2030年に両分野20%を目標", note: "**製鉄のPOSCO(005490.KS)とは別会社**。旧POSCOケミカル", companyId: "posco-future-m" },
    ],
  },
  {
    id: "x-lithium",
    layer: "MATERIAL",
    title: "リチウム資源",
    subtitle: "炭酸リチウム・水酸化リチウム（採掘〜化成品）",
    marketSize: "—（価格変動が大きく金額規模の比較に意味が薄い）",
    cagr: "—",
    driver: "EV需要の伸び率がそのまま価格に出る。2023年以降は価格下落局面",
    summary:
      "正極材ほど寡占的ではなく、上位でも1桁%台。Albemarle・SQM・贛鋒・天斉の4社が中心だが、市場全体に占める比率は分散している。**この分野は数量シェアより価格サイクルで株価が動く**ため、シェアの大小は投資判断に直結しにくい。EV需要の減速がそのまま市況に出る点が他の素材と違う。",
    source: "各社開示・業界推計（2025年時点）。シェアはリチウム化成品ベース",
    players: [
      { rank: 1, name: "Albemarle", hq: "🇺🇸 米国", share: "最大手級", sharePercent: null, shareNote: "生産量首位級", products: "炭酸/水酸化リチウム", strategy: "Greenbushes等の優良鉱山権益", note: "EV需要の減速がそのまま市況に出る", companyId: "albemarle" },
      { rank: 2, name: "SQM", hq: "🇨🇱 チリ", share: "最大手級", sharePercent: null, shareNote: "塩湖で首位級", products: "炭酸リチウム", strategy: "アタカマ塩湖の低コスト生産", note: "監視対象外", companyId: null },
      { rank: 3, name: "贛鋒鋰業(Ganfeng)", hq: "🇨🇳 中国", share: "~6%", sharePercent: 6, shareNote: "化成品で3位級", products: "リチウム化合物全般", strategy: "上流権益から化成品まで一貫", note: "", companyId: "ganfeng" },
      { rank: 4, name: "天斉鋰業(Tianqi)", hq: "🇨🇳 中国", share: "~5%", sharePercent: 5, shareNote: "4位級", products: "リチウム化合物", strategy: "Greenbushesに出資", note: "監視対象外", companyId: null },
    ],
  },
  {
    id: "x-lighting",
    layer: "TIER1",
    title: "照明",
    subtitle: "ヘッドランプ・リアランプ",
    marketSize: "~$35B（2025・自動車照明）",
    cagr: "約6%",
    driver: "LED/マトリクスADBの標準化と、灯体へのセンサー内蔵",
    summary:
      "小糸製作所が世界首位で、日系2社（小糸・スタンレー）が上位に入る数少ない分野。灯体は車種ごとの意匠部品で切り替えコストが高く、いったん採用されると長期に続く。近年はLiDARやカメラを灯体に内蔵する動きがあり、単なる照明部品からセンサー筐体へと位置づけが変わりつつある。",
    source: "各社開示・業界推計（2025年時点）。確度は中",
    players: [
      { rank: 1, name: "小糸製作所", hq: "🇯🇵 日本", share: "~20%", sharePercent: 20, shareNote: "世界首位", products: "ヘッドランプ・リアランプ", strategy: "トヨタ系。LiDAR内蔵灯体を開発", note: "", companyId: "koito" },
      { rank: 2, name: "Marelli", hq: "🇮🇹/🇯🇵", share: "~15%", sharePercent: 15, shareNote: "2位級", products: "ヘッドランプ", strategy: "欧州OEM向け", note: "監視対象外。経営再建を経て継続", companyId: null },
      { rank: 3, name: "HELLA (Forvia)", hq: "🇩🇪 ドイツ", share: "~13%", sharePercent: 13, shareNote: "3位級", products: "ヘッドランプ・電子部品", strategy: "Forvia傘下で電子と一体提案", note: "Forviaとして監視中（内装分野に掲載）", companyId: "forvia" },
      { rank: 4, name: "Valeo", hq: "🇫🇷 フランス", share: "~11%", sharePercent: 11, shareNote: "4位級", products: "ヘッドランプ・ADAS一体灯体", strategy: "センサーと灯体の統合", note: "電子ユニット分野にも掲載", companyId: "valeo" },
      { rank: 5, name: "スタンレー電気", hq: "🇯🇵 日本", share: "~10%", sharePercent: 10, shareNote: "国内2位級", products: "ヘッドランプ・LED", strategy: "LED素子から内製", note: "ホンダ系の比重が高い", companyId: "stanley" },
    ],
  },
];
