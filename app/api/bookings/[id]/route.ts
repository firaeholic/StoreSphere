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

    const bookingId = parseInt(params.id)
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const booking = await prisma.propertyBooking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        guest: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check if user is either the guest or the property owner
    if (booking.guestId !== user.id && booking.property.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only view your own bookings" },
        { status: 403 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Booking fetch error:", error)
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

    const bookingId = parseInt(params.id)
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, paymentStatus } = body

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if booking exists
    const existingBooking = await prisma.propertyBooking.findUnique({
      where: { id: bookingId },
      include: {
        property: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check permissions
    const isGuest = existingBooking.guestId === user.id
    const isPropertyOwner = existingBooking.property.ownerId === user.id

    if (!isGuest && !isPropertyOwner) {
      return NextResponse.json(
        { error: "Forbidden: You can only modify your own bookings" },
        { status: 403 }
      )
    }

    // Validate status transitions
    if (status) {
      if (isGuest && status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Guests can only cancel bookings" },
          { status: 400 }
        )
      }
      
      if (isPropertyOwner && !['CONFIRMED', 'CANCELLED'].includes(status)) {
        return NextResponse.json(
          { error: "Property owners can only confirm or cancel bookings" },
          { status: 400 }
        )
      }
    }

    // Update booking
    const updatedBooking = await prisma.propertyBooking.update({
      where: { id: bookingId },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus })
      },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        guest: true
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Booking update error:", error)
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

    const bookingId = parseInt(params.id)
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if booking exists
    const existingBooking = await prisma.propertyBooking.findUnique({
      where: { id: bookingId },
      include: {
        property: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check permissions - only guests can delete their own bookings
    if (existingBooking.guestId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own bookings" },
        { status: 403 }
      )
    }

    // Only allow deletion of pending or cancelled bookings
    if (!['PENDING', 'CANCELLED'].includes(existingBooking.status)) {
      return NextResponse.json(
        { error: "Cannot delete confirmed bookings. Please cancel first." },
        { status: 400 }
      )
    }

    // Delete the booking
    await prisma.propertyBooking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Booking deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}