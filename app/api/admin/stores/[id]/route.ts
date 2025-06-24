import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "BANNED"]),
  domain: z.string().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the current user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateStoreSchema.parse(body)
    const { name, description, status, domain } = validatedData

    // Update the store
    const updatedStore = await prisma.store.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        description: description || null,
        status,
        domain: domain || null,
      },
    })

    return NextResponse.json(updatedStore)
  } catch (error) {
    console.error("Error updating store:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the current user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    // Delete the store and all related data
    await prisma.$transaction(async (tx) => {
      // Delete order items first
      await tx.orderItem.deleteMany({
        where: {
          order: {
            storeId: parseInt(params.id),
          },
        },
      })

      // Delete orders
      await tx.order.deleteMany({
        where: { storeId: parseInt(params.id) },
      })

      // Delete products
      await tx.product.deleteMany({
        where: { storeId: parseInt(params.id) },
      })

      // Finally delete the store
      await tx.store.delete({
        where: { id: parseInt(params.id) },
      })
    })

    return NextResponse.json({ message: "Store deleted successfully" })
  } catch (error) {
    console.error("Error deleting store:", error)
    return NextResponse.json({ error: "Failed to delete store" }, { status: 500 })
  }
}