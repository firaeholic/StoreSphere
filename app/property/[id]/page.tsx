import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Users, Bed, Bath, Wifi, Car, Coffee, Tv } from "lucide-react"
import { BookingForm } from "@/components/property/booking-form"

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { userId } = await auth()
  
  const property = await prisma.property.findUnique({
    where: { id: params.id },
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const amenityIcons: { [key: string]: any } = {
    'WiFi': Wifi,
    'Parking': Car,
    'Coffee': Coffee,
    'TV': Tv,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Properties
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{property.rating.toFixed(1)} rating</span>
                </div>
              </div>
            </div>
            <Badge variant={property.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {property.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.images && property.images.length > 0 ? (
                  property.images.slice(0, 4).map((image, index) => (
                    <div key={index} className={`${index === 0 ? 'md:col-span-2' : ''} aspect-video bg-gray-200 rounded-lg overflow-hidden`}>
                      <img
                        src={image}
                        alt={`${property.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No images available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Property Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-gray-600" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-gray-600" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span>Up to {property.maxGuests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">${property.price}</span>
                    <span className="text-gray-600">/night</span>
                  </div>
                </div>
                
                {property.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{property.description}</p>
                  </div>
                )}

                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, index) => {
                        const IconComponent = amenityIcons[amenity] || Coffee
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle>Hosted by {property.owner.firstName || 'Host'}</CardTitle>
                <CardDescription>
                  Member since {new Date(property.owner.createdAt).getFullYear()}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Book Your Stay</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">${property.price}</div>
                      <div className="text-sm text-gray-600">per night</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userId ? (
                    <BookingForm 
                      property={property} 
                      userId={userId}
                      existingBookings={property.bookings}
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Please sign in to book this property</p>
                      <Link href="/sign-in" className="w-full">
                        <Button className="w-full">
                          Sign In to Book
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}