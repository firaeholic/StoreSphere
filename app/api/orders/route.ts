import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createOrderSchema = z.object({
  productId: z.union([z.string(), z.number()]).transform(val => String(val)),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  storeSlug: z.string().min(1, "Store slug is required"),
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)
    const { productId, quantity, storeSlug } = validatedData

    // Get or create user using upsert to avoid unique constraint issues
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: `temp_${userId}@example.com`, // Temporary email to avoid constraint
        firstName: "",
        lastName: "",
      },
    })

    // Get the product and store
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: {
        store: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.store.slug !== storeSlug) {
      return NextResponse.json({ error: "Invalid store" }, { status: 400 })
    }

    // Check if user is trying to order their own product
    if (product.store.ownerId === user.id) {
      return NextResponse.json({ error: "You cannot order your own product" }, { status: 400 })
    }

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Calculate total amount
    const totalAmount = product.price * quantity

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: user.id,
        storeId: product.storeId,
        status: "PENDING",
        total: totalAmount,
        shippingAddress: {},
        items: {
          create: {
            productId: product.id,
            quantity,
            price: product.price,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
      },
    })

    // Update product stock
    await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ orders: [] })
    }

    const orders = await prisma.order.findMany({
      where: { customerId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}