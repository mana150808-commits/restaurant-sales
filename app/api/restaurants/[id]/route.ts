import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const { salesStatus, memo } = body

  const updated = await prisma.restaurant.update({
    where: { id },
    data: {
      ...(salesStatus !== undefined && { salesStatus }),
      ...(memo !== undefined && { memo }),
      salesUpdatedAt: new Date(),
    },
  })

  if (salesStatus) {
    await prisma.salesHistory.create({
      data: {
        restaurantId: id,
        action: salesStatus,
        note: memo || null,
      },
    })
  }

  return Response.json(updated)
}
