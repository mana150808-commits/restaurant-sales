import { NextRequest } from "next/server"
import { db } from "@/lib/firebase"
import { checkSiteQuality, calcContextScore } from "@/lib/site-checker"
import { checkNearbyPlaces } from "@/lib/nearby-checker"

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText"
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.types",
  "places.googleMapsUri",
  "places.location",
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

  const jobRef = await db.collection("searchJobs").add({
    area,
    keyword,
    status: "running",
    createdAt: new Date().toISOString(),
  })

  let collected = 0
  let pageToken: string | undefined

  try {
    do {
      const body: Record<string, unknown> = {
        textQuery: `${keyword} ${area}`,
        languageCode: "ja",
        pageSize: 20,
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

      await Promise.all(places.map(async (place: Record<string, unknown>) => {
        const website = (place.websiteUri as string) || null
        const location = place.location as { latitude?: number; longitude?: number } | null
        const lat = location?.latitude ?? null
        const lng = location?.longitude ?? null
        const priceLevel = (place.priceLevel as string) || null
        const userRatingsTotal = (place.userRatingCount as number) || null

        const [siteResult, nearbyPlaces] = await Promise.all([
          checkSiteQuality(website),
          lat && lng ? checkNearbyPlaces(lat, lng, apiKey) : Promise.resolve([]),
        ])

        const contextScore = calcContextScore({ priceLevel, nearbyPlaces, userRatingsTotal })
        const finalScore = Math.min(200, siteResult.siteScore + contextScore)

        const restaurantData = {
          placeId: place.id,
          name: (place.displayName as { text?: string })?.text || "不明",
          address: (place.formattedAddress as string) || null,
          phone: (place.nationalPhoneNumber as string) || null,
          website,
          googleMapsUrl: (place.googleMapsUri as string) || null,
          rating: (place.rating as number) || null,
          userRatingsTotal,
          priceLevel,
          types: (place.types as string[])?.join(",") || null,
          latitude: lat,
          longitude: lng,
          nearbyPlaces: JSON.stringify(nearbyPlaces),
          ...siteResult,
          siteScore: finalScore,
          siteCheckedAt: new Date().toISOString(),
        }

        const ref = db.collection("restaurants").doc(place.id as string)
        const snap = await ref.get()
        if (!snap.exists) {
          await ref.set({ ...restaurantData, createdAt: new Date().toISOString() })
        } else {
          await ref.update(restaurantData)
        }
        collected++
      }))

      if (!pageToken) break
    } while (collected < 60)

    await jobRef.update({ status: "done", total: collected })
    return Response.json({ success: true, collected, jobId: jobRef.id })
  } catch (error) {
    await jobRef.update({ status: "error" })
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 500 }
    )
  }
}
