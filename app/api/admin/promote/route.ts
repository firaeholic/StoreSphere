import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the current user is already an admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // For demo purposes, allow any user to promote themselves to admin
    // In a real app, you'd have proper authorization checks
    const { targetUserId, action } = await request.json()

    if (action === "promote-self") {
      // Promote current user to admin
      const updatedUser = await prisma.user.update({
        where: { clerkId: userId },
        data: { role: "ADMIN" },
      })

      return NextResponse.json({ 
        success: true, 
        message: "Successfully promoted to admin",
        user: updatedUser 
      })
    }

    if (action === "promote-user" && targetUserId) {
      // Only allow admins to promote other users
      if (currentUser.role !== "ADMIN") {
        return NextResponse.json({ error: "Only admins can promote other users" }, { status: 403 })
      }

      const targetUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: "ADMIN" },
      })

      return NextResponse.json({ 
        success: true, 
        message: "User promoted to admin",
        user: targetUser 
      })
    }

    if (action === "demote-user" && targetUserId) {
      // Only allow admins to demote other users
      if (currentUser.role !== "ADMIN") {
        return NextResponse.json({ error: "Only admins can demote other users" }, { status: 403 })
      }

      const targetUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: "CUSTOMER" },
      })

      return NextResponse.json({ 
        success: true, 
        message: "User demoted to customer",
        user: targetUser 
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Admin promotion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}