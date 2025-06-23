import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PaymentForm } from "@/components/payment/payment-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Users, Home } from "lucide-react"
import { format } from "date-fns"

export default async function PaymentPage({ searchParams }: { searchParams: { booking?: string } }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  if (!searchParams.booking) {
    redirect("/")
  }

  let bookingData
  try {
    bookingData = JSON.parse(decodeURIComponent(searchParams.booking))
  } catch (error) {
    redirect("/")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Sample property data - in real app, fetch from database
  const properties = {
    "1": { name: "Luxury Downtown Apartment", location: "Downtown, City Center" },
    "2": { name: "Cozy Beach House", location: "Beachfront, Ocean Drive" },
    "3": { name: "Mountain Cabin Retreat", location: "Mountain View, Forest Hills" }
  }

  const property = properties[bookingData.propertyId as keyof typeof properties]

  if (!property) {
    redirect("/")
  }

  const checkInDate = new Date(bookingData.checkIn)
  const checkOutDate = new Date(bookingData.checkOut)
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Booking Summary
                </CardTitle>
                <CardDescription>
                  Review your booking details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{property.name}</h3>
                  <p className="text-gray-600">{property.location}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>Check-in</span>
                    </div>
                    <span className="font-medium">{format(checkInDate, "PPP")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>Check-out</span>
                    </div>
                    <span className="font-medium">{format(checkOutDate, "PPP")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Guests</span>
                    </div>
                    <span className="font-medium">{bookingData.guests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-gray-500" />
                      <span>Rooms</span>
                    </div>
                    <span className="font-medium">{bookingData.rooms}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Nights:</span>
                    <span>{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per night:</span>
                    <span>${bookingData.total / nights / bookingData.rooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rooms:</span>
                    <span>{bookingData.rooms}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>${bookingData.total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service fee:</span>
                    <span>${(bookingData.total * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Taxes:</span>
                    <span>${(bookingData.total * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${(bookingData.total * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Free cancellation up to 24 hours before check-in</p>
                  <p>• 50% refund for cancellations within 24 hours</p>
                  <p>• No refund for no-shows</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <PaymentForm 
              bookingData={{
                ...bookingData,
                propertyName: property.name,
                finalTotal: (bookingData.total * 1.18).toFixed(2)
              }} 
              user={user} 
            />
          </div>
        </div>
      </main>
    </div>
  )
}