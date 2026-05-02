export type SiteCheckResult = {
  siteStatus: "none" | "weak" | "fair" | "good"
  siteScore: number
  hasMobileSupport: boolean
  hasContactForm: boolean
  hasReservation: boolean
  pageCount: number
  hasInstagram: boolean
  hasSNS: boolean
  hasMultipleLocations: boolean
  hasLunch: boolean
  hasEnglish: boolean
}

export type SiteCheckContext = {
  priceLevel?: string | null
  nearbyPlaces?: { type: string }[]
  userRatingsTotal?: number | null
}

function getWebsiteStatus(score: number): SiteCheckResult["siteStatus"] {
  if (score <= 20) return "weak"
  if (score <= 50) return "fair"
  return "good"
}

export function calcContextScore(context: SiteCheckContext): number {
  let score = 0

  // 単価帯（Places API priceLevel）
  const priceLevelScores: Record<string, number> = {
    PRICE_LEVEL_VERY_EXPENSIVE: 30,
    PRICE_LEVEL_EXPENSIVE: 25,
    PRICE_LEVEL_MODERATE: 15,
    PRICE_LEVEL_INEXPENSIVE: 5,
  }
  score += priceLevelScores[context.priceLevel || ""] ?? 0

  // 立地（nearbyPlaces）
  const nearby = context.nearbyPlaces || []
  let locationScore = 0
  if (nearby.some(p => p.type === "tourist_attraction")) locationScore += 15
  if (nearby.some(p => p.type === "train_station")) locationScore += 10
  if (nearby.some(p => ["shopping_mall", "department_store"].includes(p.type))) locationScore += 10
  if (nearby.some(p => p.type === "university")) locationScore += 5
  if (nearby.some(p => ["stadium", "amusement_park"].includes(p.type))) locationScore += 5
  score += Math.min(20, locationScore)

  // 口コミ数
  const reviews = context.userRatingsTotal ?? 0
  if (reviews >= 500) score += 15
  else if (reviews >= 200) score += 10
  else if (reviews >= 50) score += 5

  return score
}

export async function checkSiteQuality(url: string | null): Promise<SiteCheckResult> {
  if (!url) {
    return {
      siteStatus: "none",
      siteScore: 0,
      hasMobileSupport: false,
      hasContactForm: false,
      hasReservation: false,
      pageCount: 0,
      hasInstagram: false,
      hasSNS: false,
      hasMultipleLocations: false,
      hasLunch: false,
      hasEnglish: false,
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SalesBot/1.0)" },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return {
        siteStatus: "weak",
        siteScore: 10,
        hasMobileSupport: false,
        hasContactForm: false,
        hasReservation: false,
        pageCount: 1,
        hasInstagram: false,
        hasSNS: false,
        hasMultipleLocations: false,
      }
    }

    const html = await res.text()
    const lower = html.toLowerCase()

    // 既存チェック
    const hasMobileSupport = lower.includes('name="viewport"') || lower.includes("name='viewport'")
    const hasContactForm = lower.includes("お問い合わせ") || lower.includes("contact") || lower.includes("<form")
    const hasReservation = lower.includes("予約") || lower.includes("reserve") || lower.includes("booking") || lower.includes("reservation")
    const internalLinks = (html.match(/href=["'][^"']*["']/gi) || []).filter(
      h => !h.includes("http") || h.includes(new URL(url).hostname)
    ).length
    const pageCount = Math.min(Math.max(internalLinks, 1), 20)

    // ランチ営業チェック
    const hasLunch = lower.includes("ランチ") || lower.includes("lunch") || lower.includes("昼食") || lower.includes("昼営業")

    // 英語対応チェック
    const hasEnglish =
      html.includes('hreflang="en"') ||
      html.includes("hreflang='en'") ||
      lower.includes("/en/") ||
      lower.includes("?lang=en") ||
      lower.includes('lang="en"')

    // SNSチェック
    const hasInstagram = lower.includes("instagram.com")
    const hasTwitter = lower.includes("twitter.com") || lower.includes("x.com")
    const hasFacebook = lower.includes("facebook.com")
    const hasTikTok = lower.includes("tiktok.com")
    const hasSNS = hasInstagram || hasTwitter || hasFacebook || hasTikTok

    // 規模感チェック
    const hasMultipleLocations =
      lower.includes("店舗一覧") ||
      lower.includes("各店舗") ||
      lower.includes("全店") ||
      lower.includes("2号店") ||
      lower.includes("支店") ||
      lower.includes("branch")
    const hasLargeSeats =
      /([2-9][0-9]|[1-9][0-9]{2,})\s*席/.test(html) ||
      lower.includes("大型") ||
      lower.includes("宴会場")

    // スコア計算（Webサイト基本: max 100）
    let baseScore = 0
    if (hasMobileSupport) baseScore += 30
    if (hasContactForm) baseScore += 20
    if (hasReservation) baseScore += 20
    if (pageCount >= 5) baseScore += 20
    else if (pageCount >= 2) baseScore += 10
    if (html.length > 5000) baseScore += 10

    // SNSボーナス（max 20）
    let snsScore = 0
    if (hasInstagram) snsScore += 15
    if (hasTwitter || hasFacebook || hasTikTok) snsScore += 5
    snsScore = Math.min(20, snsScore)

    // 規模感ボーナス（max 15）
    let scaleScore = 0
    if (hasMultipleLocations) scaleScore += 15
    else if (hasLargeSeats) scaleScore += 10
    scaleScore = Math.min(15, scaleScore)

    const siteScore = baseScore + snsScore + scaleScore

    return {
      siteStatus: getWebsiteStatus(baseScore),
      siteScore,
      hasMobileSupport,
      hasContactForm,
      hasReservation,
      pageCount,
      hasInstagram,
      hasSNS,
      hasMultipleLocations,
      hasLunch,
      hasEnglish,
    }
  } catch {
    return {
      siteStatus: "weak",
      siteScore: 5,
      hasMobileSupport: false,
      hasContactForm: false,
      hasReservation: false,
      pageCount: 0,
      hasInstagram: false,
      hasSNS: false,
      hasMultipleLocations: false,
      hasLunch: false,
      hasEnglish: false,
    }
  }
}
