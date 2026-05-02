import { NextRequest } from "next/server"
import { db } from "@/lib/firebase"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { salesStatus, memo } = body

  const updateData: Record<string, unknown> = { salesUpdatedAt: new Date().toISOString() }
  if (salesStatus !== undefined) updateData.salesStatus = salesStatus
  if (memo !== undefined) updateData.memo = memo

  await db.collection("restaurants").doc(id).update(updateData)

  if (salesStatus) {
    await db.collection("salesHistory").add({
      restaurantId: id,
      action: salesStatus,
      note: memo || null,
      createdAt: new Date().toISOString(),
    })
  }

  return Response.json({ id, ...updateData })
}
