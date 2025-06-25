import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, Users, Home, Mail, Phone, Download } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default async function BookingConfirmationPage({ searchParams }: { searchParams: { booking?: string } }) {
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
    console.error("Error parsing booking data:", error)
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
          <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Message */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-green-900">Booking Confirmed!</h2>
                  <p className="text-green-700">Your reservation has been successfully processed.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Booking Details
                </CardTitle>
                <CardDescription>
                  Confirmation ID: {bookingData.bookingId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{bookingData.propertyName}</h3>
                  <Badge variant="default" className="mt-1">Confirmed</Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Check-in</span>
                    </div>
                    <span className="font-medium">{format(checkInDate, "PPP")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
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
                  <div className="flex items-center justify-between">
                    <span>Nights</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total Paid:</span>
                  <span className="text-green-600">${bookingData.finalTotal}</span>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Whats Next?</CardTitle>
                <CardDescription>
                  Important information for your stay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Confirmation Email</h4>
                      <p className="text-sm text-gray-600">A confirmation email has been sent to your registered email address.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Host Contact</h4>
                      <p className="text-sm text-gray-600">The property host will contact you 24 hours before check-in with detailed instructions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Check-in Instructions</h4>
                      <p className="text-sm text-gray-600">You will receive check-in details and access codes via email and SMS.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Booking Confirmation
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Add to Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Check-in Policy</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check-in time: 3:00 PM - 10:00 PM</li>
                    <li>• Late check-in available upon request</li>
                    <li>• Valid ID required at check-in</li>
                    <li>• Smoking is not permitted</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Free cancellation up to 24 hours before check-in</li>
                    <li>• 50% refund for cancellations within 24 hours</li>
                    <li>• No refund for no-shows</li>
                    <li>• Contact support for assistance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}