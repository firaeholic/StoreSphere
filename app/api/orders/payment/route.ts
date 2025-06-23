import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, paymentMethod, paymentDetails } = body

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                store: true
              }
            }
          }
        },
        store: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Verify the order belongs to the user
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to process this order" },
        { status: 403 }
      )
    }

    // Check if order is already completed
    if (order.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Order is already completed" },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Process payment with Stripe/PayPal
    // 2. Validate payment details
    // 3. Handle payment failures
    
    // For now, we'll simulate successful payment
    const serviceFee = order.totalAmount * 0.05
    const tax = order.totalAmount * 0.08
    const finalTotal = order.totalAmount + serviceFee + tax

    // Update order status to completed
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        paymentMethod,
        paymentDate: new Date(),
        finalAmount: finalTotal
      }
    })

    // Update store revenue and order count
    await prisma.store.update({
      where: { id: order.storeId },
      data: {
        revenue: {
          increment: order.totalAmount
        },
        orders: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Payment processed successfully"
    })

  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}