import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const promoteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
})

export async function POST(request: NextRequest) {
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
    const validatedData = promoteUserSchema.parse(body)
    const { userId: targetUserId } = validatedData

    // Promote the user to admin
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(targetUserId) },
      data: {
        role: "ADMIN",
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error promoting user:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to promote user" }, { status: 500 })
  }
}