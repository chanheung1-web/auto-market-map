import type { Layer } from "./companies";

// 部品カテゴリ（セグメント）。バリューチェーンの6階層の**下位分類**にあたる。
//
// 以前このアプリには「サプライチェーン」と「バリューチェーン」という2つの一覧が
// あったが、業界用語としてほぼ同義の2語で中身の違い（構造 vs 値動き）を表そうと
// していて読み手に伝わらなかった。実際には Excel の15カテゴリが6階層の下位分類
// そのものだったので、1本の木に統合した。
//
//   階層（6） → セグメント（この定義） → 企業（companies.ts）
//
// 市場規模・CAGR・上位5社シェアは automotive_supply_chain_v2.xlsx（2024年基準）
// 由来で、supplyChain.ts が持つ。Excel に無いセグメント（完成車・電池など）は
// 市場データを持たず、企業一覧だけになる。

export type SegmentId =
  | "oem-passenger"
  | "oem-commercial"
  | "ecu"
  | "harness"
  | "powertrain"
  | "chassis"
  | "interior"
  | "tire"
  | "glass"
  | "seal"
  | "brake"
  | "thermal"
  | "exhaust"
  | "lighting"
  | "safety"
  | "battery-cell"
  | "battery-next"
  | "mcu"
  | "power-semi"
  | "analog-passive"
  | "adas-soc"
  | "lidar"
  | "auto-software"
  | "steel"
  | "aluminum"
  | "resin"
  | "paint"
  | "cathode-anode"
  | "lithium"
  | "material-other";

export type Segment = {
  id: SegmentId;
  layer: Layer;
  label: string;
  /** 何を指すカテゴリか。1行。 */
  scope: string;
  /** supplyChain.ts のカテゴリ id。市場規模・シェアを引くための紐付け。 */
  supplyId: string | null;
};

// 並び順は「完成車に近い側 → 素材側」。画面もこの順に出る。
export const SEGMENTS: Segment[] = [
  { id: "oem-passenger", layer: "OEM", label: "完成車（乗用車）", scope: "乗用車・SUV・EVの完成車メーカー", supplyId: null },
  { id: "oem-commercial", layer: "OEM", label: "商用車", scope: "トラック・バス・商用バン", supplyId: null },

  { id: "ecu", layer: "TIER1", label: "電子ユニット（ECU/IVI）", scope: "ECU・ドメインコントローラ・インフォテインメント", supplyId: "c11-ecu-ivi" },
  { id: "harness", layer: "TIER1", label: "ワイヤーハーネス", scope: "低圧・高圧ハーネス・コネクタ", supplyId: "c10-ハーネス" },
  { id: "powertrain", layer: "TIER1", label: "駆動・パワートレイン部品", scope: "変速機・eAxle・モーター・エンジン部品", supplyId: null },
  { id: "chassis", layer: "TIER1", label: "シャシー・サスペンション", scope: "フレーム・サスペンション・ステアリング・ホイール", supplyId: "c3-シャシー-サスペンション" },
  { id: "interior", layer: "TIER1", label: "シート・内装", scope: "シート・内装トリム・ヘッドライナー", supplyId: "c7-シート" },
  { id: "tire", layer: "TIER1", label: "タイヤ・ゴム", scope: "タイヤ・ゴムホース・防振材", supplyId: "c5-タイヤ-ゴム" },
  { id: "glass", layer: "TIER1", label: "ガラス・サンルーフ", scope: "自動車ガラス・サンルーフ", supplyId: "c9-ガラス-サンルーフ" },
  { id: "seal", layer: "TIER1", label: "シール・ウェザーストリップ", scope: "ウェザーストリップ・オイルシール", supplyId: "c4-シール-ウェザーストリップ" },
  { id: "brake", layer: "TIER1", label: "ブレーキ", scope: "キャリパー・パッド・ABS/ESC", supplyId: "x-brake" },
  { id: "thermal", layer: "TIER1", label: "熱マネジメント・空調", scope: "HVAC・熱交換器・EV用ヒートポンプ", supplyId: "x-thermal" },
  { id: "exhaust", layer: "TIER1", label: "排気・触媒", scope: "排気系・排ガス触媒", supplyId: "x-exhaust" },
  { id: "lighting", layer: "TIER1", label: "照明", scope: "ヘッドランプ・リアランプ", supplyId: "x-lighting" },
  { id: "safety", layer: "TIER1", label: "安全部品", scope: "エアバッグ・シートベルト", supplyId: "x-safety" },

  { id: "battery-cell", layer: "BATTERY", label: "車載電池セル", scope: "リチウムイオン電池セル・モジュール", supplyId: "x-battery-cell" },
  { id: "battery-next", layer: "BATTERY", label: "次世代電池", scope: "全固体電池等、量産前の開発段階", supplyId: null },

  { id: "mcu", layer: "SEMI", label: "車載MCU", scope: "マイコン・車載プロセッサ", supplyId: "c12-mcu" },
  { id: "power-semi", layer: "SEMI", label: "パワー半導体（SiC/IGBT）", scope: "SiC MOSFET・IGBT・パワーモジュール", supplyId: "c13-パワー半導体" },
  { id: "analog-passive", layer: "SEMI", label: "アナログ・受動部品・センサ", scope: "MLCC・アナログIC・ディスクリート", supplyId: null },

  { id: "adas-soc", layer: "SOFTWARE", label: "ADAS SoC・イメージセンサ", scope: "自動運転チップ・車載カメラ", supplyId: "c14-adas-soc-カメラ" },
  { id: "lidar", layer: "SOFTWARE", label: "LiDAR", scope: "レーザー測距センサ", supplyId: null },
  { id: "auto-software", layer: "SOFTWARE", label: "車載ソフト・SDV基盤", scope: "車載OS・ミドルウェア・MaaS基盤", supplyId: null },

  { id: "steel", layer: "MATERIAL", label: "鋼材", scope: "高張力鋼板・電磁鋼板", supplyId: "c1-metal鋼材" },
  { id: "aluminum", layer: "MATERIAL", label: "アルミ部品", scope: "アルミパネル・鋳造品", supplyId: "c2-metalアルミ" },
  { id: "resin", layer: "MATERIAL", label: "樹脂・化学素材", scope: "自動車用樹脂・繊維・中間膜", supplyId: "c6-樹脂素材" },
  { id: "paint", layer: "MATERIAL", label: "塗料・コーティング", scope: "OEM塗料・補修塗料", supplyId: "c15-塗料-コーティング" },
  { id: "cathode-anode", layer: "MATERIAL", label: "正極材・負極材", scope: "カソード(NCM/LFP)・アノード(黒鉛・シリコン)", supplyId: "x-cathode-anode" },
  { id: "lithium", layer: "MATERIAL", label: "リチウム資源", scope: "炭酸リチウム・水酸化リチウム", supplyId: "x-lithium" },
  { id: "material-other", layer: "MATERIAL", label: "その他素材", scope: "触媒・リサイクル・電子材料", supplyId: null },
];

export const SEGMENT_BY_ID = new Map(SEGMENTS.map((s) => [s.id, s]));

// 企業 -> セグメント。多角化した大手（ボッシュ・デンソー・コンチネンタル等）は
// 複数分野にまたがるが、木にする以上どこか1つに置くしかない。
// **売上構成ではなく「このアプリでその企業を追う理由」で決めている。**
// 例：Continental はタイヤも作るが、ここで見たいのは車載電子なので ecu に置く。
// Excel の上位5社ランキングには元の分野で出てくるので、情報は失われない。
export const COMPANY_SEGMENT: Record<string, SegmentId> = {
  // ── 完成車（乗用車）
  toyota: "oem-passenger", honda: "oem-passenger", nissan: "oem-passenger",
  suzuki: "oem-passenger", mazda: "oem-passenger", subaru: "oem-passenger",
  "mitsubishi-motors": "oem-passenger", daihatsu: "oem-passenger",
  gm: "oem-passenger", ford: "oem-passenger", tesla: "oem-passenger",
  rivian: "oem-passenger", lucid: "oem-passenger", vw: "oem-passenger",
  mercedes: "oem-passenger", bmw: "oem-passenger", porsche: "oem-passenger",
  stellantis: "oem-passenger", renault: "oem-passenger", ferrari: "oem-passenger",
  "volvo-car": "oem-passenger", byd: "oem-passenger", geely: "oem-passenger",
  greatwall: "oem-passenger", nio: "oem-passenger", xpeng: "oem-passenger",
  liauto: "oem-passenger", hyundai: "oem-passenger", kia: "oem-passenger",
  maruti: "oem-passenger", "tatamotors-pv": "oem-passenger", mahindra: "oem-passenger",

  // ── 商用車
  isuzu: "oem-commercial", hino: "oem-commercial", fuso: "oem-commercial",
  udtrucks: "oem-commercial", paccar: "oem-commercial", "volvo-ab": "oem-commercial",
  "tatamotors-cv": "oem-commercial",

  // ── 部品
  denso: "ecu", bosch: "ecu", continental: "ecu", "hyundai-mobis": "ecu",
  "tokai-rika": "ecu", pioneer: "ecu", valeo: "ecu", huayu: "ecu",

  "sumitomo-electric": "harness", yazaki: "harness", aptiv: "harness",
  samvardhana: "harness",

  aisin: "powertrain", nidec: "powertrain", borgwarner: "powertrain",
  exedy: "powertrain", "toyota-industries": "powertrain", "daido-metal": "powertrain",
  futaba: "powertrain", niterra: "powertrain", musashi: "powertrain",

  magna: "chassis", zf: "chassis", jtekt: "chassis", topy: "chassis",

  "toyota-boshoku": "interior", "ts-tech": "interior", lear: "interior", forvia: "interior",

  bridgestone: "tire", michelin: "tire", "yokohama-rubber": "tire", "toyo-tire": "tire",

  agc: "glass", fuyao: "glass",

  "toyoda-gosei": "seal", nok: "seal",

  koito: "lighting", stanley: "lighting",

  autoliv: "safety",

  // ── 電池
  panasonic: "battery-cell", gsyuasa: "battery-cell", catl: "battery-cell",
  eve: "battery-cell", lges: "battery-cell", "samsung-sdi": "battery-cell",
  skon: "battery-cell", ppes: "battery-cell",
  quantumscape: "battery-next",

  // ── 半導体
  renesas: "mcu", infineon: "mcu", nxp: "mcu", microchip: "mcu",
  st: "power-semi", rohm: "power-semi", "mitsubishi-electric": "power-semi",
  sanken: "power-semi", onsemi: "power-semi",
  murata: "analog-passive", tdk: "analog-passive", kyocera: "analog-passive",
  adi: "analog-passive", ti: "analog-passive", nexperia: "analog-passive",

  // ── ソフトウェア・自動運転
  nvidia: "adas-soc", qualcomm: "adas-soc", mobileye: "adas-soc",
  "horizon-robotics": "adas-soc", sony: "adas-soc",
  luminar: "lidar", innoviz: "lidar", hesai: "lidar",
  elektrobit: "auto-software", hitachi: "auto-software", fujitsu: "auto-software",
  nec: "auto-software", pksha: "auto-software", tier4: "auto-software",

  // ── 素材
  nipponsteel: "steel", "kobe-steel": "steel", arcelormittal: "steel",
  toray: "resin", "asahi-kasei": "resin", "mitsui-chemicals": "resin",
  "sekisui-chemical": "resin",
  "sumitomo-metal-mining": "cathode-anode", "posco-future-m": "cathode-anode",
  ganfeng: "lithium", albemarle: "lithium",
  dowa: "material-other",

  // ── 上位プレイヤーとして追加したぶん
  posco: "steel",
  thyssenkrupp: "steel",
  ssab: "steel",
  "norsk-hydro": "aluminum",
  constellium: "aluminum",
  uacj: "aluminum",
  hindalco: "aluminum",
  basf: "resin",
  covestro: "resin",
  lyondellbasell: "resin",
  dupont: "resin",
  sabic: "resin",
  ppg: "paint",
  axalta: "paint",
  akzonobel: "paint",
  "nippon-paint": "paint",
  umicore: "cathode-anode",
  "hunan-yuneng": "cathode-anode",
  "hubei-wanrun": "cathode-anode",
  dynanonic: "cathode-anode",
  sqm: "lithium",
  tianqi: "lithium",
  adient: "interior",
  "yanfeng-hasco": "interior",
  gestamp: "chassis",
  kyb: "chassis",
  goodyear: "tire",
  pirelli: "tire",
  "cooper-standard": "seal",
  "nishikawa-rubber": "seal",
  nsg: "glass",
  "saint-gobain": "glass",
  "furukawa-electric": "harness",
  visteon: "ecu",
  joyson: "safety",
  daicel: "safety",
  calb: "battery-cell",
  gotion: "battery-cell",
  wolfspeed: "power-semi",
  "will-semi": "adas-soc",

  // ── 新設カテゴリぶん
  brembo: "brake",
  "knorr-bremse": "brake",
  "hl-mando": "brake",
  akebono: "brake",
  hanon: "thermal",
  modine: "thermal",
  mahle: "thermal",
  "johnson-matthey": "exhaust",
  eberspaecher: "exhaust",
  cataler: "exhaust",
};

/**
 * その企業のセグメント。未登録なら null。
 *
 * 画面から追加した銘柄はここに載らないので必ず null になる。呼び出し側は
 * 「未分類」として階層の末尾にまとめること（落として消さない）。
 */
export function segmentOf(companyId: string): SegmentId | null {
  return COMPANY_SEGMENT[companyId] ?? null;
}
