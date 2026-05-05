import { NextRequest } from "next/server"
import { db } from "@/lib/firebase"

type RestaurantDoc = Record<string, unknown> & { id: string }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const salesStatus = searchParams.get("salesStatus")
  const siteStatus = searchParams.get("siteStatus")
  const search = searchParams.get("search")

  const snapshot = await db.collection("restaurants").get()
  let restaurants: RestaurantDoc[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))

  if (salesStatus && salesStatus !== "all") {
    restaurants = restaurants.filter(r => r["salesStatus"] === salesStatus)
  }
  if (siteStatus && siteStatus !== "all") {
    restaurants = restaurants.filter(r => r["siteStatus"] === siteStatus)
  }
  if (search) {
    const s = search.toLowerCase()
    restaurants = restaurants.filter(r =>
      (r["name"] as string)?.toLowerCase().includes(s) ||
      (r["address"] as string)?.toLowerCase().includes(s)
    )
  }

  restaurants.sort((a, b) => {
    const scoreA = (a["siteScore"] as number) ?? 0
    const scoreB = (b["siteScore"] as number) ?? 0
    if (scoreA !== scoreB) return scoreA - scoreB
    const dateA = new Date((a["createdAt"] as string) || 0).getTime()
    const dateB = new Date((b["createdAt"] as string) || 0).getTime()
    return dateB - dateA
  })

  return Response.json(restaurants)
}
