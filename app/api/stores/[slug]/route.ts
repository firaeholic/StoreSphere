import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user to verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find store by slug and verify ownership
    const store = await prisma.store.findFirst({
      where: {
        slug: params.slug,
        ownerId: user.id
      },
      include: {
        owner: true,
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    return NextResponse.json(store)
  } catch (error) {
    console.error("Store fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user to verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, slug, description, currency, status } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      )
    }

    // Check if slug is already taken by another store
    if (slug !== params.slug) {
      const existingStore = await prisma.store.findFirst({
        where: {
          slug,
          NOT: {
            slug: params.slug
          }
        }
      })

      if (existingStore) {
        return NextResponse.json(
          { error: "Store URL is already taken" },
          { status: 400 }
        )
      }
    }

    // Find and update store
    const store = await prisma.store.findFirst({
      where: {
        slug: params.slug,
        ownerId: user.id
      }
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        name,
        slug,
        description,
        currency,
        status
      },
      include: {
        owner: true,
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      }
    })

    return NextResponse.json(updatedStore)
  } catch (error) {
    console.error("Store update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user to verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find store by slug and verify ownership
    const store = await prisma.store.findFirst({
      where: {
        slug: params.slug,
        ownerId: user.id
      }
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Delete the store (this will cascade delete related products and orders)
    await prisma.store.delete({
      where: { id: store.id }
    })

    return NextResponse.json({ message: "Store deleted successfully" })
  } catch (error) {
    console.error("Store delete error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}