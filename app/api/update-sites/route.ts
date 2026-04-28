import { prisma } from "@/lib/prisma"
import { checkSiteQuality } from "@/lib/site-checker"

export async function POST() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const restaurants = await prisma.restaurant.findMany({
    where: {
      OR: [
        { siteCheckedAt: null },
        { siteCheckedAt: { lt: oneDayAgo } },
      ],
    },
    take: 20,
  })

  let updated = 0
  for (const r of restaurants) {
    const result = await checkSiteQuality(r.website)
    await prisma.restaurant.update({
      where: { id: r.id },
      data: { ...result, siteCheckedAt: new Date() },
    })
    updated++
  }

  return Response.json({ updated })
}
