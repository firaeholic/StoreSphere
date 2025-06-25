import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, CalendarIcon, Users, Clock, Download, Share } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface ConfirmationPageProps {
  params: {
    id: string
  }
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
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
    where: { id: Number(params.id) },
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
          <p className="text-gray-600 mb-6">The booking you are looking for does not exist.</p>
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
          <p className="text-gray-600 mb-6">You do not have permission to view this booking.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const nights = differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))
  const serviceFee = booking.totalPrice * 0.1
  const taxes = booking.totalPrice * 0.08
  const finalTotal = booking.totalPrice + serviceFee + taxes

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-600 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your reservation has been successfully confirmed</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Booking Details</span>
                    <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Confirmation Number: {booking.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">


                  <Separator />

                  {/* Stay Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarIcon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">Check-in</span>
                        </div>
                        <p className="text-lg">{format(new Date(booking.checkIn), "EEEE, MMMM d, yyyy")}</p>
                        <p className="text-sm text-gray-600">After 3:00 PM</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">Guests</span>
                        </div>
                        <p className="text-lg">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarIcon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">Check-out</span>
                        </div>
                        <p className="text-lg">{format(new Date(booking.checkOut), "EEEE, MMMM d, yyyy")}</p>
                        <p className="text-sm text-gray-600">Before 11:00 AM</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">Duration</span>
                        </div>
                        <p className="text-lg">{nights} {nights === 1 ? 'Night' : 'Nights'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Important Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">House Rules</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Check-in: 3:00 PM - 10:00 PM</li>
                      <li>• Check-out: 11:00 AM</li>
                      <li>• No smoking</li>
                      <li>• No pets allowed</li>
                      <li>• No parties or events</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-gray-600">
                      Free cancellation until 48 hours before check-in. After that, 50% refund up to 24 hours before check-in.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary & Actions */}
            <div className="lg:col-span-1">
              {/* Price Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>${booking.totalPrice} × {nights} nights</span>
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
                    <span>Total Paid</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Payment Confirmed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Manage Your Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Share className="mr-2 h-4 w-4" />
                    Share Booking
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Contact Host
                  </Button>
                  
                  <Separator />
                  
                  <Link href="/bookings" className="w-full">
                    <Button variant="secondary" className="w-full">
                      View All Bookings
                    </Button>
                  </Link>
                  
                  <Link href="/" className="w-full">
                    <Button className="w-full">
                      Book Another Stay
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}