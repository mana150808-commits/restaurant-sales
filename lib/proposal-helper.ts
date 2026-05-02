export type Weakness = {
  level: "critical" | "warning"
  text: string
}

export type ProposalType = {
  type: string
  label: string
  description: string
  icon: string
}

export type CaseStudy = {
  title: string
  summary: string
  result: string
  budget: string
  scenario: string
}

export type Competitor = {
  id: string
  name: string
  address: string | null
  website: string | null
  siteStatus: string
  siteScore: number | null
}

const CASE_STUDIES: CaseStudy[] = [
  {
    scenario: "inbound",
    title: "観光地の老舗そば店 多言語対応リニューアル",
    summary: "英語・中国語・韓国語対応で海外客の予約導線を整備",
    result: "海外客数 +200%・直接予約 +80%",
    budget: "50〜80万円",
  },
  {
    scenario: "inbound",
    title: "港町シーフードレストラン インバウンド特化LP",
    summary: "Googleマップ連携・多言語メニュー・QRコード決済を一括対応",
    result: "インバウンド売上 +150%",
    budget: "30〜60万円",
  },
  {
    scenario: "branding",
    title: "高級割烹 シェフブランディングサイト",
    summary: "シェフの経歴・哲学・料理写真で高単価客層へのアプローチを強化",
    result: "客単価 +15%・メディア掲載 3件",
    budget: "80〜150万円",
  },
  {
    scenario: "branding",
    title: "フランス料理店 世界観重視のリブランディング",
    summary: "動画背景・こだわりの食材紹介・シェズナラティブでファン獲得",
    result: "リピート率 +30%・SNSフォロワー +500人",
    budget: "100〜200万円",
  },
  {
    scenario: "reservation",
    title: "居酒屋グループ 予約システム一元化",
    summary: "電話予約からオンライン予約へ移行し、キャンセル管理・売上予測も自動化",
    result: "電話対応 -60%・予約数 +80%",
    budget: "30〜60万円",
  },
  {
    scenario: "reservation",
    title: "人気ラーメン店 順番待ちDX化",
    summary: "並ばずに待てる順番管理システムをサイトから直接案内",
    result: "顧客満足度スコア +40pts・回転率 +20%",
    budget: "20〜40万円",
  },
  {
    scenario: "sns",
    title: "カフェ Instagram連動サイト構築",
    summary: "Instagramの投稿をサイトに自動反映・ハッシュタグ誘導で拡散促進",
    result: "SNS流入 +150%・投稿エンゲージメント +3倍",
    budget: "20〜40万円",
  },
  {
    scenario: "sns",
    title: "スイーツ店 TikTok×サイト連携",
    summary: "TikTok動画をトップページに埋め込み・若年層への認知拡大",
    result: "20代来客 +60%・月間PV 10倍",
    budget: "15〜30万円",
  },
  {
    scenario: "multi",
    title: "焼肉チェーン 多店舗統合ブランドサイト",
    summary: "バラバラだった各店サイトを統一デザインで統合・運用コスト削減",
    result: "管理工数 -70%・グループ予約 +30%",
    budget: "100〜200万円",
  },
  {
    scenario: "review",
    title: "地元人気食堂 口コミ活用型LP",
    summary: "Googleクチコミ・食べログレビューを活用したLP制作でSEO強化",
    result: "オーガニック流入 +120%・新規客率 +25%",
    budget: "15〜30万円",
  },
  {
    scenario: "lunch",
    title: "ビジネス街のランチ特化サイト改修",
    summary: "日替わりランチメニューをSNS連動で毎日自動更新・周辺オフィスへ拡散",
    result: "ランチ来客数 +40%・リピーター +50%",
    budget: "15〜25万円",
  },
  {
    scenario: "station",
    title: "駅前居酒屋 帰宅需要特化サイト",
    summary: "乗り換え検索からの流入を想定したLP・当日予約に特化した導線設計",
    result: "当日予約 +90%・空席稼働率 +35%",
    budget: "20〜35万円",
  },
]

export type RestaurantForProposal = {
  id: string
  name: string
  address: string | null
  website: string | null
  siteStatus: string
  siteScore: number | null
  hasMobileSupport: boolean | null
  hasContactForm: boolean | null
  hasReservation: boolean | null
  hasInstagram: boolean | null
  hasSNS: boolean | null
  hasMultipleLocations: boolean | null
  hasLunch: boolean | null
  hasEnglish: boolean | null
  nearbyPlaces: string | null
  priceLevel: string | null
  userRatingsTotal: number | null
  latitude: number | null
  longitude: number | null
}

export function analyzeWeaknesses(r: RestaurantForProposal): Weakness[] {
  const weaknesses: Weakness[] = []
  const nearby = JSON.parse(r.nearbyPlaces || "[]") as { type: string }[]
  const hasTourist = nearby.some(p => p.type === "tourist_attraction")

  if (!r.website) {
    weaknesses.push({ level: "critical", text: "ウェブサイトが存在しない" })
    return weaknesses
  }
  if (!r.hasMobileSupport) weaknesses.push({ level: "critical", text: "スマートフォン非対応（現代では必須）" })
  if (!r.hasContactForm) weaknesses.push({ level: "critical", text: "問い合わせフォームがない" })
  if (!r.hasReservation) weaknesses.push({ level: "critical", text: "オンライン予約機能がない" })
  if (!r.hasInstagram) weaknesses.push({ level: "warning", text: "Instagram等のSNS活用なし（集客機会の損失）" })
  if (hasTourist && !r.hasEnglish) weaknesses.push({ level: "critical", text: "観光地近くだが英語対応ページがない（インバウンド機会損失）" })
  if (!r.hasEnglish && (r.priceLevel === "PRICE_LEVEL_EXPENSIVE" || r.priceLevel === "PRICE_LEVEL_VERY_EXPENSIVE")) {
    weaknesses.push({ level: "warning", text: "高価格帯だが多言語対応なし（外国人富裕層へのリーチ不足）" })
  }

  return weaknesses
}

export function getProposalTypes(r: RestaurantForProposal): ProposalType[] {
  const nearby = JSON.parse(r.nearbyPlaces || "[]") as { type: string }[]
  const hasTourist = nearby.some(p => p.type === "tourist_attraction")
  const hasStation = nearby.some(p => p.type === "train_station")
  const isExpensive = ["PRICE_LEVEL_EXPENSIVE", "PRICE_LEVEL_VERY_EXPENSIVE"].includes(r.priceLevel || "")

  const types: ProposalType[] = []

  if (hasTourist || (isExpensive && !r.hasEnglish)) {
    types.push({
      type: "inbound",
      label: "インバウンド対応型",
      icon: "🌏",
      description: "多言語対応・Google Maps連携・QRコード決済で海外客を取り込む",
    })
  }
  if (isExpensive || (r.userRatingsTotal ?? 0) > 200) {
    types.push({
      type: "branding",
      label: "ブランディング型",
      icon: "✨",
      description: "シェフの哲学・こだわり食材・世界観で高単価客層へのアプローチ",
    })
  }
  if (!r.hasReservation) {
    types.push({
      type: "reservation",
      label: "予約効率化型",
      icon: "📅",
      description: "オンライン予約導入で電話対応削減・満席管理を自動化",
    })
  }
  if (r.hasInstagram) {
    types.push({
      type: "sns",
      label: "SNS連動型",
      icon: "📸",
      description: "Instagram投稿の自動反映・ハッシュタグ施策でSNS集客を強化",
    })
  }
  if (r.hasMultipleLocations) {
    types.push({
      type: "multi",
      label: "多店舗統合型",
      icon: "🏪",
      description: "各店サイトを統一ブランドで統合・運用コストを削減",
    })
  }
  if ((r.userRatingsTotal ?? 0) > 100) {
    types.push({
      type: "review",
      label: "口コミ活用型",
      icon: "⭐",
      description: "Googleクチコミ・食べログレビューを活用したLP制作でSEO強化",
    })
  }
  if (r.hasLunch && hasStation) {
    types.push({
      type: "lunch",
      label: "ランチ集客特化型",
      icon: "🍱",
      description: "日替わりランチをSNS連動で自動更新・近隣オフィス・駅利用者に訴求",
    })
  }
  if (hasStation && !r.hasReservation) {
    types.push({
      type: "station",
      label: "帰宅需要特化型",
      icon: "🚉",
      description: "駅近の立地を活かした当日予約・空席案内に特化した導線設計",
    })
  }

  return types
}

export function matchCaseStudies(r: RestaurantForProposal): CaseStudy[] {
  const types = getProposalTypes(r).map(t => t.type)
  return CASE_STUDIES.filter(cs => types.includes(cs.scenario)).slice(0, 3)
}

import { haversineDistance } from "@/lib/route-optimizer"

export function findCompetitors(
  target: RestaurantForProposal,
  allRestaurants: RestaurantForProposal[],
  radiusKm = 2.0
): Competitor[] {
  return allRestaurants
    .filter(r =>
      r.id !== target.id &&
      r.siteStatus === "good" &&
      r.latitude &&
      r.longitude &&
      target.latitude &&
      target.longitude &&
      haversineDistance(target.latitude, target.longitude, r.latitude, r.longitude) <= radiusKm
    )
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      website: r.website,
      siteStatus: r.siteStatus,
      siteScore: r.siteScore,
    }))
}
