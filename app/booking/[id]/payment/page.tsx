import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PaymentForm } from "@/components/booking/payment-form"
import { CalendarIcon, MapPin, Users, Clock } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface PaymentPageProps {
  params: {
    id: string
  }
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    redirect("/sign-in")
  }

  const booking = await prisma.propertyBooking.findUnique({
    where: { id: params.id },
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Check if user owns this booking
  if (booking.guestId !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to view this booking.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))
  const serviceFee = booking.totalPrice * 0.1 // 10% service fee
  const taxes = booking.totalPrice * 0.08 // 8% taxes
  const finalTotal = booking.totalPrice + serviceFee + taxes

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/property/${booking.property.id}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Property
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Review your booking details and complete payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Summary</span>
                  <Badge variant={booking.status === 'PENDING' ? 'secondary' : 'default'}>
                    {booking.status}
                  </Badge>
                </CardTitle>
                <CardDescription>Booking ID: {booking.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Info */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {booking.property.images && booking.property.images.length > 0 ? (
                      <img
                        src={booking.property.images[0]}
                        alt={booking.property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{booking.property.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{booking.property.location}</span>
                    </div>
                    <p className="text-sm text-gray-600">Hosted by {booking.property.owner.firstName || 'Host'}</p>
                  </div>
                </div>

                <Separator />

                {/* Booking Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Check-in</span>
                    </div>
                    <span className="font-medium">{format(new Date(booking.checkIn), "PPP")}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Check-out</span>
                    </div>
                    <span className="font-medium">{format(new Date(booking.checkOut), "PPP")}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Guests</span>
                    </div>
                    <span className="font-medium">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="font-medium">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>${booking.property.price} × {nights} nights</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Your payment is secure and encrypted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentForm 
                  booking={booking}
                  totalAmount={finalTotal}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}