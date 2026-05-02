import { db } from "@/lib/firebase"
import { checkSiteQuality } from "@/lib/site-checker"

export async function POST() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const nullSnapshot = await db.collection("restaurants")
    .where("siteCheckedAt", "==", null)
    .limit(20)
    .get()

  const oldSnapshot = await db.collection("restaurants")
    .where("siteCheckedAt", "<", oneDayAgo)
    .limit(20)
    .get()

  const seen = new Set<string>()
  const restaurants: Array<{ id: string; website: string | null }> = []

  for (const doc of [...nullSnapshot.docs, ...oldSnapshot.docs]) {
    if (!seen.has(doc.id) && restaurants.length < 20) {
      seen.add(doc.id)
      restaurants.push({ id: doc.id, website: doc.data().website || null })
    }
  }

  let updated = 0
  for (const r of restaurants) {
    const result = await checkSiteQuality(r.website)
    await db.collection("restaurants").doc(r.id).update({
      ...result,
      siteCheckedAt: new Date().toISOString(),
    })
    updated++
  }

  return Response.json({ updated })
}
