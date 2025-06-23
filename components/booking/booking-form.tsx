"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, CreditCard, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"

interface Property {
  id: string
  name: string
  price: number
  maxGuests: number
}

interface BookingFormProps {
  property: Property
  user: User
}

export function BookingForm({ property, user }: BookingFormProps) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState("1")
  const [rooms, setRooms] = useState("1")
  const [isLoading, setIsLoading] = useState(false)

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    const roomCount = parseInt(rooms)
    return nights * property.price * roomCount
  }

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates")
      return
    }

    setIsLoading(true)

    try {
      // Create booking record
      const bookingData = {
        propertyId: property.id,
        userId: user.id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: parseInt(guests),
        rooms: parseInt(rooms),
        total: calculateTotal(),
        status: 'PENDING'
      }

      // In a real app, you would save this to the database
      console.log('Booking data:', bookingData)

      // Redirect to payment page
      router.push(`/payment?booking=${encodeURIComponent(JSON.stringify(bookingData))}`)
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Book Your Stay
          <span className="text-2xl font-bold text-blue-600">
            ${property.price}/night
          </span>
        </CardTitle>
        <CardDescription>
          Complete your booking details below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Check-in</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Check-out</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date <= (checkIn || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Guests and Rooms */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Guests</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: property.maxGuests }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {i + 1} Guest{i > 0 ? 's' : ''}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rooms</Label>
            <Select value={rooms} onValueChange={setRooms}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 3 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} Room{i > 0 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Booking Summary */}
        {checkIn && checkOut && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Dates:</span>
                <span>{format(checkIn, "MMM dd")} - {format(checkOut, "MMM dd")}</span>
              </div>
              <div className="flex justify-between">
                <span>Nights:</span>
                <span>{calculateNights()}</span>
              </div>
              <div className="flex justify-between">
                <span>Rooms:</span>
                <span>{rooms}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span>{guests}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button 
          onClick={handleBooking}
          disabled={!checkIn || !checkOut || isLoading}
          className="w-full"
          size="lg"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isLoading ? "Processing..." : `Book Now - $${calculateTotal()}`}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          You won't be charged until your booking is confirmed
        </p>
      </CardContent>
    </Card>
  )
}