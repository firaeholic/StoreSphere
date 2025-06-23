import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user to verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const productId = parseInt(params.id)
    
    // Find the product and verify ownership through store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId: user.id
        }
      },
      include: {
        store: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or you don't have permission to access it" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
    
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user to verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const productId = parseInt(params.id)
    
    // Find the product and verify ownership through store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId: user.id
        }
      },
      include: {
        store: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or you don't have permission to delete it" },
        { status: 404 }
      )
    }

    // Check if product has any pending orders
    const pendingOrders = await prisma.order.findFirst({
      where: {
        items: {
          some: {
            productId: productId
          }
        },
        status: {
          in: ["PENDING", "PROCESSING"]
        }
      }
    })

    if (pendingOrders) {
      return NextResponse.json(
        { error: "Cannot delete product with pending orders" },
        { status: 400 }
      )
    }

    // Delete the product
    await prisma.product.delete({
      where: {
        id: productId
      }
    })

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Product deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user to verify ownership
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const productId = parseInt(params.id)
    const body = await request.json()
    const {
      name,
      description,
      price,
      images,
      stock,
      status
    } = body

    // Find the product and verify ownership through store
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          ownerId: user.id
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or you don't have permission to update it" },
        { status: 404 }
      )
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(images && { images: JSON.stringify(images) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(status && { status })
      },
      include: {
        store: true
      }
    })

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}