export type SiteCheckResult = {
  siteStatus: "none" | "weak" | "fair" | "good"
  siteScore: number
  hasMobileSupport: boolean
  hasContactForm: boolean
  hasReservation: boolean
  pageCount: number
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
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

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
      }
    }

    const html = await res.text()
    const lower = html.toLowerCase()

    const hasMobileSupport =
      lower.includes('name="viewport"') || lower.includes("name='viewport'")

    const hasContactForm =
      lower.includes("お問い合わせ") ||
      lower.includes("contact") ||
      lower.includes("<form")

    const hasReservation =
      lower.includes("予約") ||
      lower.includes("reserve") ||
      lower.includes("booking") ||
      lower.includes("reservation")

    const internalLinks = (html.match(/href=["'][^"']*["']/gi) || []).filter(
      (h) => !h.includes("http") || h.includes(new URL(url).hostname)
    ).length
    const pageCount = Math.min(Math.max(internalLinks, 1), 20)

    let score = 0
    if (hasMobileSupport) score += 30
    if (hasContactForm) score += 20
    if (hasReservation) score += 20
    if (pageCount >= 5) score += 20
    else if (pageCount >= 2) score += 10
    if (html.length > 5000) score += 10

    let siteStatus: SiteCheckResult["siteStatus"]
    if (score <= 20) siteStatus = "weak"
    else if (score <= 50) siteStatus = "fair"
    else siteStatus = "good"

    return {
      siteStatus,
      siteScore: score,
      hasMobileSupport,
      hasContactForm,
      hasReservation,
      pageCount,
    }
  } catch {
    return {
      siteStatus: "weak",
      siteScore: 5,
      hasMobileSupport: false,
      hasContactForm: false,
      hasReservation: false,
      pageCount: 0,
    }
  }
}
