import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = parseInt(params.id)
    
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: true,
        bookings: {
          where: {
            status: {
              in: ["CONFIRMED", "PENDING"]
            }
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    // Parse JSON strings back to arrays for the response
    const propertyWithParsedData = {
      ...property,
      amenities: JSON.parse(property.amenities || '[]'),
      images: JSON.parse(property.images || '[]')
    }

    return NextResponse.json(propertyWithParsedData)
  } catch (error) {
    console.error("Property fetch error:", error)
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

    const propertyId = parseInt(params.id)
    
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      location, 
      price, 
      bedrooms, 
      bathrooms, 
      maxGuests, 
      amenities, 
      images,
      status
    } = body

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

    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    if (existingProperty.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own properties" },
        { status: 403 }
      )
    }

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(location && { location }),
        ...(price && { price }),
        ...(bedrooms && { bedrooms }),
        ...(bathrooms && { bathrooms }),
        ...(maxGuests && { maxGuests }),
        ...(amenities && { amenities: JSON.stringify(amenities) }),
        ...(images && { images: JSON.stringify(images) }),
        ...(status && { status })
      },
      include: {
        owner: true
      }
    })

    // Parse JSON strings back to arrays for the response
    const propertyWithParsedData = {
      ...updatedProperty,
      amenities: JSON.parse(updatedProperty.amenities || '[]'),
      images: JSON.parse(updatedProperty.images || '[]')
    }

    return NextResponse.json(propertyWithParsedData)
  } catch (error) {
    console.error("Property update error:", error)
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

    const propertyId = parseInt(params.id)
    
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
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

    // Check if property exists and user owns it
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        bookings: true
      }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      )
    }

    if (existingProperty.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own properties" },
        { status: 403 }
      )
    }

    // Check if there are active bookings
    const activeBookings = existingProperty.bookings.filter(
      booking => booking.status === "CONFIRMED" || booking.status === "PENDING"
    )

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete property with active bookings" },
        { status: 400 }
      )
    }

    // Delete the property
    await prisma.property.delete({
      where: { id: propertyId }
    })

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Property deletion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}