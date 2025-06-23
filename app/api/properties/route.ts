import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
      images 
    } = body

    // Validate required fields
    if (!name || !location || !price || !bedrooms || !bathrooms || !maxGuests) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate data types and ranges
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      )
    }

    if (typeof bedrooms !== 'number' || bedrooms <= 0) {
      return NextResponse.json(
        { error: "Bedrooms must be a positive number" },
        { status: 400 }
      )
    }

    if (typeof bathrooms !== 'number' || bathrooms <= 0) {
      return NextResponse.json(
        { error: "Bathrooms must be a positive number" },
        { status: 400 }
      )
    }

    if (typeof maxGuests !== 'number' || maxGuests <= 0) {
      return NextResponse.json(
        { error: "Max guests must be a positive number" },
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

    // Create property
    const property = await prisma.property.create({
      data: {
        name,
        description,
        location,
        price,
        bedrooms,
        bathrooms,
        maxGuests,
        amenities: amenities || [],
        images: images || [],
        ownerId: user.id,
        status: "ACTIVE"
      },
      include: {
        owner: true
      }
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error("Property creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const location = searchParams.get('location')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const maxGuests = searchParams.get('maxGuests')
    const amenities = searchParams.get('amenities')?.split(',')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: "ACTIVE"
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (bedrooms) {
      where.bedrooms = {
        gte: parseInt(bedrooms)
      }
    }

    if (bathrooms) {
      where.bathrooms = {
        gte: parseInt(bathrooms)
      }
    }

    if (maxGuests) {
      where.maxGuests = {
        gte: parseInt(maxGuests)
      }
    }

    if (amenities && amenities.length > 0) {
      where.amenities = {
        hasEvery: amenities
      }
    }

    // Get properties with pagination
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: true,
          bookings: {
            where: {
              status: {
                in: ["CONFIRMED", "PENDING"]
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ])

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Properties fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}