import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkSiteQuality } from "@/lib/site-checker"

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText"
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.rating",
  "places.userRatingCount",
  "places.types",
  "places.googleMapsUri",
  "nextPageToken",
].join(",")

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return Response.json({ error: "GOOGLE_PLACES_API_KEY が設定されていません" }, { status: 500 })
  }

  const { area, keyword = "レストラン" } = await req.json()
  if (!area) {
    return Response.json({ error: "area は必須です" }, { status: 400 })
  }

  const searchJob = await prisma.searchJob.create({
    data: { area, keyword, status: "running" },
  })

  let collected = 0
  let pageToken: string | undefined

  try {
    do {
      const body: Record<string, unknown> = {
        textQuery: `${keyword} ${area}`,
        languageCode: "ja",
        maxResultCount: 20,
      }
      if (pageToken) body.pageToken = pageToken

      const res = await fetch(PLACES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Places API エラー: ${err}`)
      }

      const data = await res.json()
      const places = data.places || []
      pageToken = data.nextPageToken

      for (const place of places) {
        const website = place.websiteUri || null
        const siteResult = await checkSiteQuality(website)

        await prisma.restaurant.upsert({
          where: { placeId: place.id },
          create: {
            placeId: place.id,
            name: place.displayName?.text || "不明",
            address: place.formattedAddress || null,
            phone: place.nationalPhoneNumber || null,
            website,
            googleMapsUrl: place.googleMapsUri || null,
            rating: place.rating || null,
            userRatingsTotal: place.userRatingCount || null,
            types: place.types?.join(",") || null,
            ...siteResult,
            siteCheckedAt: new Date(),
          },
          update: {
            name: place.displayName?.text || "不明",
            address: place.formattedAddress || null,
            phone: place.nationalPhoneNumber || null,
            website,
            googleMapsUrl: place.googleMapsUri || null,
            rating: place.rating || null,
            userRatingsTotal: place.userRatingCount || null,
            types: place.types?.join(",") || null,
            ...siteResult,
            siteCheckedAt: new Date(),
          },
        })
        collected++
      }

      if (!pageToken) break
    } while (collected < 60)

    await prisma.searchJob.update({
      where: { id: searchJob.id },
      data: { status: "done", total: collected },
    })

    return Response.json({ success: true, collected, jobId: searchJob.id })
  } catch (error) {
    await prisma.searchJob.update({
      where: { id: searchJob.id },
      data: { status: "error" },
    })
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 500 }
    )
  }
}
