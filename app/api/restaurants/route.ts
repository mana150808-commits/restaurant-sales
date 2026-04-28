import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const salesStatus = searchParams.get("salesStatus")
  const siteStatus = searchParams.get("siteStatus")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {}
  if (salesStatus && salesStatus !== "all") where.salesStatus = salesStatus
  if (siteStatus && siteStatus !== "all") where.siteStatus = siteStatus
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { address: { contains: search } },
    ]
  }

  const restaurants = await prisma.restaurant.findMany({
    where,
    orderBy: [{ siteScore: "asc" }, { createdAt: "desc" }],
  })

  return Response.json(restaurants)
}
