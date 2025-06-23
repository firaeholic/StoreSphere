import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string().min(1, "Store URL is required").regex(/^[a-z0-9-]+$/, "Store URL can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      currency: formData.get("currency") as string,
    }

    const validatedData = createStoreSchema.parse(data)

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    // Check if slug is already taken
    const existingStore = await prisma.store.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingStore) {
      return NextResponse.json(
        { error: "Store URL is already taken" },
        { status: 400 }
      )
    }

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: "", // Will be updated from Clerk webhook
          firstName: "", // Will be updated from Clerk webhook
          lastName: "", // Will be updated from Clerk webhook
        },
      })
    }

    // Create the store
    const store = await prisma.store.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        currency: validatedData.currency,
        ownerId: user.id,
        status: "ACTIVE",
      },
    })

    return NextResponse.redirect(new URL(`/dashboard?store=${store.slug}`, request.url))
  } catch (error) {
    console.error("Error creating store:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user to access their stores
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Build where clause - only show user's stores
    const where: any = {
      ownerId: user.id
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search
          }
        },
        {
          description: {
            contains: search
          }
        }
      ]
    }

    if (status) {
      where.status = status
    }

    // Get stores with pagination
    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        include: {
          owner: true,
          _count: {
            select: {
              products: true,
              orders: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.store.count({ where })
    ])

    return NextResponse.json({
      stores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Stores fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}