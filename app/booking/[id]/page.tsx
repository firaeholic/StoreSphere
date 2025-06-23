import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BookingForm } from "@/components/booking/booking-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Bed, Bath, Wifi, Car } from "lucide-react"

// Sample property data - replace with real database
const properties = {
  "1": {
    id: "1",
    name: "Luxury Downtown Apartment",
    description: "Modern 2-bedroom apartment in the heart of the city with stunning skyline views",
    price: 150,
    location: "Downtown, City Center",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    amenities: ["WiFi", "Parking", "Kitchen", "Air Conditioning", "Balcony"],
    images: ["/placeholder.jpg"],
    available: true
  },
  "2": {
    id: "2",
    name: "Cozy Beach House",
    description: "Perfect getaway with ocean views and private beach access",
    price: 200,
    location: "Beachfront, Ocean Drive",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    amenities: ["WiFi", "Beach Access", "Kitchen", "BBQ Grill", "Ocean View"],
    images: ["/placeholder.jpg"],
    available: true
  },
  "3": {
    id: "3",
    name: "Mountain Cabin Retreat",
    description: "Rustic cabin surrounded by nature and hiking trails",
    price: 120,
    location: "Mountain View, Forest Hills",
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    amenities: ["WiFi", "Fireplace", "Kitchen", "Hiking Trails", "Mountain View"],
    images: ["/placeholder.jpg"],
    available: true
  }
}

export default async function BookingPage({ params }: { params: { id: string } }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const property = properties[params.id as keyof typeof properties]

  if (!property) {
    redirect("/")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Book Your Stay</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Property Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{property.name}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    ${property.price}/night
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">{property.description}</p>
                
                {/* Property Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium">{property.bedrooms} Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium">{property.bathrooms} Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium">Up to {property.maxGuests} Guests</div>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Image */}
            <Card>
              <CardContent className="p-0">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <BookingForm property={property} user={user} />
          </div>
        </div>
      </main>
    </div>
  )
}