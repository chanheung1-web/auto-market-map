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
    id: "x-thermal-ev",
    layer: "TIER1",
    title: "EV熱マネジメント",
    subtitle: "ヒートポンプ・電子膨張弁・統合熱回路・電池冷却",
    marketSize: "~$3.8B（2025・EV熱マネジメント）→ 2035年 $17B予測",
    cagr: "16.3%",
    driver: "EVには暖房に使えるエンジン廃熱が無く、電池の温度管理が航続距離と寿命を直接左右する",
    summary:
      "**空調（キャビンを冷やす）とは別の市場**として切り出している。EVでは冷媒回路が電池・パワエレ・キャビンをまたぐ統合回路になり、その制御弁と熱交換モジュールが競争の核になった。ここは中国の三花智控が圧倒的で、電子膨張弁52.6%・統合部品65.7%（2023）と世界首位。Valeo・Mahleは各15%程度にとどまる。三花はTeslaの最大の外部熱マネジメント供給元とされ、Tesla自身もOctovalve等を内製している。日系はキャビン空調では強いが、この統合熱回路の領域では上位に出てこない。",
    source: "各社開示・ResearchInChina 等（弁・統合部品シェアは2023年）、市場規模は GMInsights（2025）。空調の数字と混同しないこと",
    players: [
      { rank: 1, name: "三花智控(Sanhua)", hq: "🇨🇳 中国", share: "弁 ~52.6% / 統合部品 ~65.7%", sharePercent: 52.6, shareNote: "電子膨張弁で圧倒的首位", products: "電子膨張弁・四方弁・マイクロチャネル熱交換器", strategy: "冷媒回路の制御部品を押さえて統合モジュールへ", note: "Teslaの最大の外部熱マネジメント供給元とされる。2023年時点のシェア", companyId: "sanhua" },
      { rank: 2, name: "Hanon Systems", hq: "🇰🇷 韓国", share: "統合モジュールで上位", sharePercent: null, shareNote: "専業で先行", products: "ヒートポンプ・電池冷却・統合熱モジュール", strategy: "電池・キャビン・パワエレを束ねたモジュール供給", note: "熱マネジメント専業。空調分野にも掲載", companyId: "hanon" },
      { rank: 3, name: "Valeo", hq: "🇫🇷 フランス", share: "~15%", sharePercent: 15, shareNote: "欧州勢", products: "ヒートポンプ・熱回路", strategy: "高級EV向けの高効率ヒートポンプ", note: "空調・電子ユニット分野にも掲載", companyId: "valeo" },
      { rank: 4, name: "MAHLE", hq: "🇩🇪 ドイツ", share: "~15%", sharePercent: 15, shareNote: "欧州勢", products: "熱交換器・ヒートポンプ", strategy: "内燃機関部品からの転換途上", note: "非上場(財団所有)。空調分野にも掲載", companyId: "mahle" },
      { rank: 5, name: "銀輪股份(Yinlun)", hq: "🇨🇳 中国", share: "中国勢2番手", sharePercent: null, shareNote: "コスト競争力", products: "熱交換器・冷却モジュール", strategy: "中国EVメーカー向けに低コストで供給", note: "商用車熱交換器から車載EVへ展開", companyId: "yinlun" },
      { rank: 6, name: "デンソー", hq: "🇯🇵 日本", share: "空調ほどの地位はない", sharePercent: null, shareNote: "空調では首位", products: "ヒートポンプ・電動コンプレッサ", strategy: "空調の強みをEV熱回路へ展開", note: "キャビン空調では22%で首位だが、統合熱回路では上位に出てこない", companyId: "denso" },
      { rank: 7, name: "Tesla", hq: "🇺🇸 米国", share: "内製", sharePercent: null, shareNote: "自社設計", products: "Octovalve・スーパーボトル", strategy: "熱回路を自社設計し部品だけ外注", note: "完成車分野に掲載。外販はしない", companyId: "tesla" },
    ],
  },
  {
    id: "x-oem-passenger",
    layer: "OEM",
    title: "完成車（乗用車）",
    subtitle: "世界の新車販売台数シェア（グループ連結）",
    marketSize: "世界販売 約8,000万台規模（2025・乗用車＋小型商用）",
    cagr: "低成長",
    driver: "中国勢の台頭と、欧米のEV減速。地域ごとに成長率がまったく違う",
    summary:
      "分散市場で、首位のトヨタでも13.6%。上位3グループを足しても3割強にすぎず、部品分野の寡占度とは対照的。BYDが5位まで上がり、中国勢が上位に入る構図が定着した。台数シェアと利益は連動しないので注意が必要で、フェラーリのように台数が極小でも高収益な企業がこの層には混在する。",
    source: "各社開示・業界集計（2025年通年）。グループ連結ベースで、集計範囲は資料により異なる",
    players: [
      { rank: 1, name: "トヨタ自動車", hq: "🇯🇵 日本", share: "~13.6%", sharePercent: 13.6, shareNote: "世界首位", products: "全方位。HV主体", strategy: "全パワートレインを並行", note: "1,100万台超。ダイハツ・日野を含む", companyId: "toyota" },
      { rank: 2, name: "Volkswagen", hq: "🇩🇪 ドイツ", share: "~10.3%", sharePercent: 10.3, shareNote: "2位", products: "多ブランド", strategy: "欧州・中国が両輪", note: "900万台弱", companyId: "vw" },
      { rank: 3, name: "現代自動車", hq: "🇰🇷 韓国", share: "~8.8%", sharePercent: 8.8, shareNote: "3位", products: "現代・起亜・ジェネシス", strategy: "E-GMPと北米現地生産", note: "720万台超。起亜を含むグループ計", companyId: "hyundai" },
      { rank: 4, name: "Stellantis", hq: "🇳🇱 オランダ/欧州", share: "~6.7%", sharePercent: 6.7, shareNote: "4位", products: "14ブランド", strategy: "欧州の量販ブランドを束ねる", note: "約550万台", companyId: "stellantis" },
      { rank: 5, name: "BYD", hq: "🇨🇳 中国", share: "~5.6%", sharePercent: 5.6, shareNote: "中国勢首位", products: "NEV専業", strategy: "電池内製の垂直統合", note: "約460万台。5位まで上昇", companyId: "byd" },
      { rank: 6, name: "General Motors", hq: "🇺🇸 米国", share: "~5.5%", sharePercent: 5.5, shareNote: "6位", products: "北米中心", strategy: "ピックアップの収益でEV投資", note: "約455万台", companyId: "gm" },
    ],
  },
  {
    id: "x-lidar",
    layer: "SOFTWARE",
    title: "LiDAR",
    subtitle: "車載レーザー測距センサ",
    marketSize: "急拡大中（2030年に4倍予測）",
    cagr: "高成長",
    driver: "中国OEMのADAS標準搭載競争。価格が数年で1桁下がった",
    summary:
      "中国勢がほぼ独占。Hesai・RoboSense・Huawei・Seyond の4社で約89%を占め、Hesai単独で33%前後。欧米勢のValeoは上位5社に残るものの、シェアは1桁台とみられる。価格低下が極端に速く、量産採用を取れなかったLuminar・Innovizのような欧米新興は経営継続そのものが論点になっている。この分野は技術で勝っているかより、中国OEMの採用を取れたかで決まる。",
    source: "Yole Group・MarketsandMarkets（2025）。上位4社89%・Hesai 33%は複数レポートの一致値",
    players: [
      { rank: 1, name: "Hesai(禾賽科技)", hq: "🇨🇳 中国", share: "~33%", sharePercent: 33, shareNote: "出荷数量首位", products: "ATシリーズ・半固体LiDAR", strategy: "量産規模でコストを下げる", note: "37〜39%とする資料もある", companyId: "hesai" },
      { rank: 2, name: "Huawei", hq: "🇨🇳 中国", share: "~25%", sharePercent: 25, shareNote: "2位", products: "LiDAR＋車載コンピュート", strategy: "自動運転エコシステムと一体で提供", note: "非上場", companyId: null },
      { rank: 3, name: "RoboSense(速騰聚創)", hq: "🇨🇳 中国", share: "上位3位級", sharePercent: null, shareNote: "3位", products: "MEMS/半固体LiDAR", strategy: "中国OEMへの広範な採用", note: "香港上場(2498.HK)。未登録", companyId: null },
      { rank: 4, name: "Seyond(旧Innovusion)", hq: "🇨🇳 中国", share: "上位4位級", sharePercent: null, shareNote: "4位", products: "長距離LiDAR", strategy: "NIO向けが中心", note: "非上場", companyId: null },
      { rank: 5, name: "Valeo", hq: "🇫🇷 フランス", share: "1桁%", sharePercent: null, shareNote: "欧州勢で唯一上位", products: "SCALA", strategy: "欧州OEMの量産車に搭載", note: "電子ユニット等にも掲載", companyId: "valeo" },
      { rank: 6, name: "Luminar", hq: "🇺🇸 米国", share: "僅少", sharePercent: null, shareNote: "量産採用が課題", products: "Iris", strategy: "Volvo等との量産プログラム", note: "価格低下の速さが経営を圧迫", companyId: "luminar" },
      { rank: 7, name: "Innoviz", hq: "🇮🇱 イスラエル", share: "僅少", sharePercent: null, shareNote: "量産採用が課題", products: "InnovizOne/Two", strategy: "BMW等との量産プログラム", note: "", companyId: "innoviz" },
    ],
  },
  {
    id: "x-analog-passive",
    layer: "SEMI",
    title: "アナログ・受動部品・センサ",
    subtitle: "MLCC・アナログIC・ディスクリート",
    marketSize: "MLCC全体で数兆円規模。車載向けはMLCC売上の15%（2025年末に25%超の見通し）",
    cagr: "車載向けは全体を上回る伸び",
    driver: "EV1台あたりのMLCC搭載数が内燃機関車の数倍。ADASのセンサ点数増",
    summary:
      "MLCCは村田が28〜30%で首位、サムスン電機が22〜24%で続き、上位5社で72〜78%という上位集中市場。とくに車載グレードのMLCCでは村田が40〜50%とさらに強い。EVは1台あたりの搭載数が内燃機関車より大幅に多く、車載比率がMLCC全体の15%から25%超へ上がる見通し。中国勢のシェアは10%程度に留まっており、他の部品分野と違って中国化が進んでいない。",
    source: "業界レポート（2025年）。MLCCのシェアは複数レポートの一致値。アナログIC・ディスクリートは別市場のため合算していない",
    players: [
      { rank: 1, name: "村田製作所", hq: "🇯🇵 日本", share: "~28-30%（車載は40-50%）", sharePercent: 29, shareNote: "MLCC首位", products: "MLCC", strategy: "車載グレードの高信頼品に集中", note: "車載MLCCではさらに寡占的", companyId: "murata" },
      { rank: 2, name: "サムスン電機", hq: "🇰🇷 韓国", share: "~22-24%", sharePercent: 23, shareNote: "2位", products: "MLCC", strategy: "AIサーバ向けで村田を追う", note: "009150.KS。未登録", companyId: null },
      { rank: 3, name: "TDK", hq: "🇯🇵 日本", share: "~11-13%", sharePercent: 12, shareNote: "3位", products: "MLCC・磁気センサ", strategy: "受動部品とセンサの両輪", note: "", companyId: "tdk" },
      { rank: 4, name: "太陽誘電", hq: "🇯🇵 日本", share: "~8-10%", sharePercent: 9, shareNote: "4位", products: "MLCC", strategy: "小型・大容量帯", note: "6976.T。未登録", companyId: null },
      { rank: 5, name: "京セラ", hq: "🇯🇵 日本", share: "上位5社の一角", sharePercent: null, shareNote: "5位級", products: "MLCC・電子部品", strategy: "部品からパッケージまで広く展開", note: "", companyId: "kyocera" },
    ],
  },
  {
    id: "x-brake",
    layer: "TIER1",
    title: "ブレーキ",
    subtitle: "キャリパー・パッド・ABS/ESC・回生協調",
    marketSize: "~$50B（2025）",
    cagr: "約4%",
    driver: "回生ブレーキとの協調制御、Brake-by-Wire への移行",
    summary:
      "**寡占ではなく分散市場**。上位5社を合計しても28%、上位7社で37%にとどまり、首位のBrembo でも8%台にすぎない。エアバッグ（上位3社で71%）とは正反対の構造で、摩擦材・キャリパー・電子制御と工程が分かれており、それぞれ別の企業が強いことが背景にある。EV化で回生ブレーキとの協調制御が要求され、機械部品から電子制御へ価値が移りつつある。",
    source: "業界レポート（2025年時点）。上位5社28%・上位7社37%・Brembo 8%超は複数レポートの一致値、個別配分は推計",
    players: [
      { rank: 1, name: "Brembo", hq: "🇮🇹 イタリア", share: "~8%", sharePercent: 8, shareNote: "首位だが1桁%", products: "高性能キャリパー・ディスク", strategy: "高性能帯に集中。ブランド力で価格を維持", note: "分散市場のため首位でもシェアは小さい", companyId: "brembo" },
      { rank: 2, name: "Robert Bosch", hq: "🇩🇪 ドイツ", share: "~7%", sharePercent: 7, shareNote: "電子制御で強い", products: "ABS/ESC・ブレーキシステム", strategy: "電子制御と一体で提案", note: "非上場", companyId: "bosch" },
      { rank: 3, name: "Continental", hq: "🇩🇪 ドイツ", share: "~6%", sharePercent: 6, shareNote: "3位級", products: "ブレーキシステム・MK C1", strategy: "Brake-by-Wire で先行", note: "", companyId: "continental" },
      { rank: 4, name: "Knorr-Bremse", hq: "🇩🇪 ドイツ", share: "~5%", sharePercent: 5, shareNote: "商用車で首位", products: "商用車ブレーキ", strategy: "商用車・鉄道に特化", note: "乗用車市場には出ていない", companyId: "knorr-bremse" },
      { rank: 5, name: "アイシン", hq: "🇯🇵 日本", share: "~4%", sharePercent: 4, shareNote: "5位級", products: "ブレーキ・回生協調", strategy: "トヨタのHV/EVと一体開発", note: "駆動部品分野にも掲載", companyId: "aisin" },
      { rank: 6, name: "ZF Friedrichshafen", hq: "🇩🇪 ドイツ", share: "~4%", sharePercent: 4, shareNote: "6位級", products: "ブレーキ・シャシー制御", strategy: "シャシー全体で束ねる", note: "非上場。シャシー分野にも掲載", companyId: "zf" },
      { rank: 7, name: "HL Mando", hq: "🇰🇷 韓国", share: "~3%", sharePercent: 3, shareNote: "7位級", products: "ブレーキ・ステアリング", strategy: "現代系だが外販も拡大", note: "", companyId: "hl-mando" },
    ],
  },
  {
    id: "x-thermal",
    layer: "TIER1",
    title: "熱マネジメント・空調",
    subtitle: "HVAC・熱交換器・EV用ヒートポンプ・電池冷却",
    marketSize: "~$106B（2025・熱マネジメント全体。うちHVACが~$59B）",
    cagr: "5.9%",
    driver: "EVの航続距離が空調効率に直結し、電池冷却の要求も加わって1台あたりの搭載額が増える",
    summary:
      "**EV化で価値が最も増える部品のひとつ**。内燃機関はエンジン廃熱で暖房できたが、EVにはそれが無いためヒートポンプが要り、さらに電池の温度管理が航続距離と寿命を左右する。結果、1台あたりの搭載額が内燃機関車より大きくなる数少ない分野。デンソーが約22%で首位、上位5社で約62%と中程度の集中度。",
    source: "Mordor Intelligence 他（2025年）。市場規模と首位シェア・上位5社合計は複数レポートの一致値",
    players: [
      { rank: 1, name: "デンソー", hq: "🇯🇵 日本", share: "~22%", sharePercent: 22, shareNote: "首位", products: "HVAC・コンプレッサ・熱交換器", strategy: "コンプレッサを内製し垂直統合", note: "電子ユニット分野にも掲載", companyId: "denso" },
      { rank: 2, name: "Valeo", hq: "🇫🇷 フランス", share: "~15%", sharePercent: 15, shareNote: "2位", products: "空調システム・熱交換器", strategy: "電動化と熱を束ねて提案", note: "電子ユニット分野にも掲載", companyId: "valeo" },
      { rank: 3, name: "Hanon Systems", hq: "🇰🇷 韓国", share: "~13%", sharePercent: 13, shareNote: "3位・専業", products: "ヒートポンプ・電池冷却", strategy: "熱マネジメント専業。EV向けに特化", note: "旧Halla Visteon Climate Control", companyId: "hanon" },
      { rank: 4, name: "MAHLE", hq: "🇩🇪 ドイツ", share: "~7%", sharePercent: 7, shareNote: "4位", products: "熱交換器・ピストン", strategy: "内燃機関部品からの転換途上", note: "非上場(財団所有)", companyId: "mahle" },
      { rank: 5, name: "Modine Manufacturing", hq: "🇺🇸 米国", share: "~5%", sharePercent: 5, shareNote: "5位", products: "熱交換器・冷却モジュール", strategy: "データセンター冷却にも展開", note: "車載以外の比重が上昇中", companyId: "modine" },
    ],
  },
  {
    id: "x-exhaust",
    layer: "TIER1",
    title: "排気・触媒",
    subtitle: "排気システム・排ガス浄化触媒",
    marketSize: "触媒 ~$20B / 排気系 ~$40B（2025・推計）",
    cagr: "横ばい〜減少",
    driver: "**EV化でいずれ消える市場**。当面はハイブリッド向けと排ガス規制の強化が下支え",
    summary:
      "このアプリで唯一、**構造的に縮小していく分野**。BEVには排気系も触媒も要らないため、HVが残る間の需要が事実上の上限になる。触媒は白金・パラジウム・ロジウムを使うため、シェアより貴金属市況の影響が大きい。Johnson Matthey・BASF・Umicore の3社が触媒でほぼ寡占し、排気系はForviaが中心。日系はキャタラー（トヨタ系・非上場）が担っている。",
    source: "業界推計（2025年時点）。**この分野は確度が低い**。市場規模の定義が調査会社ごとに大きく違い、触媒と排気系を分けない資料も多い",
    players: [
      { rank: 1, name: "Johnson Matthey", hq: "🇬🇧 英国", share: "触媒で首位級", sharePercent: null, shareNote: "触媒3強", products: "排ガス浄化触媒・白金族精製", strategy: "貴金属のリサイクルと一体運用", note: "EV化で触媒事業の縮小が経営課題", companyId: "johnson-matthey" },
      { rank: 2, name: "BASF", hq: "🇩🇪 ドイツ", share: "触媒で首位級", sharePercent: null, shareNote: "触媒3強", products: "排ガス浄化触媒", strategy: "化学全体の一部門として運営", note: "樹脂・塗料分野にも掲載", companyId: "basf" },
      { rank: 3, name: "Umicore", hq: "🇧🇪 ベルギー", share: "触媒で首位級", sharePercent: null, shareNote: "触媒3強", products: "排ガス浄化触媒", strategy: "正極材とリサイクルで多角化", note: "正極材分野にも掲載", companyId: "umicore" },
      { rank: 4, name: "Forvia", hq: "🇫🇷 フランス", share: "排気系で首位級", sharePercent: null, shareNote: "排気系首位", products: "排気システム", strategy: "水素貯蔵タンクへ転換を模索", note: "内装分野にも掲載", companyId: "forvia" },
      { rank: 5, name: "キャタラー", hq: "🇯🇵 日本", share: "非開示", sharePercent: null, shareNote: "日系", products: "排ガス触媒・燃料電池触媒", strategy: "燃料電池触媒へ展開", note: "非上場(トヨタ系)", companyId: "cataler" },
      { rank: 6, name: "Eberspächer", hq: "🇩🇪 ドイツ", share: "非開示", sharePercent: null, shareNote: "欧州系", products: "排気系・車載ヒーター", strategy: "EV向けヒーターへ転換", note: "非上場", companyId: "eberspaecher" },
    ],
  },
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
      { rank: 3, name: "Joyson Safety Systems", hq: "🇨🇳 中国/🇩🇪", share: "~13%", sharePercent: 13, shareNote: "3位", products: "エアバッグ・シートベルト", strategy: "タカタの事業を承継し規模を確保", note: "均勝電子(Joyson)傘下。非上場", companyId: "joyson" },
      { rank: 4, name: "Daicel (ダイセル)", hq: "🇯🇵 日本", share: "~7%", sharePercent: 7, shareNote: "インフレータ首位級", products: "エアバッグ用インフレータ", strategy: "火工品技術。完成品ではなく基幹部品に特化", note: "4202.T。監視対象外", companyId: "daicel" },
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
      { rank: 4, name: "CALB(中創新航)", hq: "🇨🇳 中国", share: "5.3%", sharePercent: 5.3, shareNote: "4位", products: "三元系・LFP", strategy: "中国OEM向けの第2調達先", note: "監視対象外", companyId: "calb" },
      { rank: 5, name: "Gotion High-tech(国軒高科)", hq: "🇨🇳 中国", share: "4.5%", sharePercent: 4.5, shareNote: "5位", products: "LFP", strategy: "VWが出資。欧州展開", note: "監視対象外", companyId: "gotion" },
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
      { rank: 1, name: "湖南裕能(Hunan Yuneng)", hq: "🇨🇳 中国", share: "114万トン", sharePercent: 23, shareNote: "LFP首位", products: "LFP正極材", strategy: "CATL・BYD向けの大量供給", note: "監視対象外", companyId: "hunan-yuneng" },
      { rank: 2, name: "湖北万潤(Hubei Wanrun)", hq: "🇨🇳 中国", share: "37.5万トン", sharePercent: 7.6, shareNote: "2位", products: "LFP正極材", strategy: "—", note: "監視対象外", companyId: "hubei-wanrun" },
      { rank: 3, name: "徳方納米(Dynanonic)", hq: "🇨🇳 中国", share: "28万トン", sharePercent: 5.7, shareNote: "3位", products: "LFP正極材", strategy: "—", note: "監視対象外", companyId: "dynanonic" },
      { rank: 4, name: "Umicore", hq: "🇧🇪 ベルギー", share: "~11.5%", sharePercent: 11.5, shareNote: "非中国で最大級", products: "三元系正極材", strategy: "欧州OEM向け。リサイクルと一体運用", note: "2024年時点のシェア。監視対象外", companyId: "umicore" },
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
      { rank: 2, name: "SQM", hq: "🇨🇱 チリ", share: "最大手級", sharePercent: null, shareNote: "塩湖で首位級", products: "炭酸リチウム", strategy: "アタカマ塩湖の低コスト生産", note: "監視対象外", companyId: "sqm" },
      { rank: 3, name: "贛鋒鋰業(Ganfeng)", hq: "🇨🇳 中国", share: "~6%", sharePercent: 6, shareNote: "化成品で3位級", products: "リチウム化合物全般", strategy: "上流権益から化成品まで一貫", note: "", companyId: "ganfeng" },
      { rank: 4, name: "天斉鋰業(Tianqi)", hq: "🇨🇳 中国", share: "~5%", sharePercent: 5, shareNote: "4位級", products: "リチウム化合物", strategy: "Greenbushesに出資", note: "監視対象外", companyId: "tianqi" },
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
