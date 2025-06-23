"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Property {
  id: string
  name: string
  price: number
  maxGuests: number
}

interface Booking {
  checkIn: Date
  checkOut: Date
  status: string
}

interface BookingFormProps {
  property: Property
  userId: string
  existingBookings: Booking[]
}

export function BookingForm({ property, userId, existingBookings }: BookingFormProps) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)

  // Get disabled dates from existing bookings
  const getDisabledDates = () => {
    const disabledDates: Date[] = []
    existingBookings.forEach(booking => {
      const start = new Date(booking.checkIn)
      const end = new Date(booking.checkOut)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        disabledDates.push(new Date(d))
      }
    })
    return disabledDates
  }

  const disabledDates = getDisabledDates()

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const nights = differenceInDays(checkOut, checkIn)
    return nights * property.price
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates")
      return
    }

    if (checkIn >= checkOut) {
      toast.error("Check-out date must be after check-in date")
      return
    }

    if (parseInt(guests) > property.maxGuests) {
      toast.error(`Maximum ${property.maxGuests} guests allowed`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests: parseInt(guests),
          totalPrice: calculateTotal()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const booking = await response.json()
      toast.success("Booking created successfully!")
      router.push(`/booking/${booking.id}/payment`)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error("Failed to create booking. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0
  const total = calculateTotal()

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Check-in Date */}
      <div className="space-y-2">
        <Label htmlFor="checkin">Check-in</Label>
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
              disabled={(date) => 
                date < new Date() || 
                disabledDates.some(disabled => 
                  disabled.toDateString() === date.toDateString()
                )
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Check-out Date */}
      <div className="space-y-2">
        <Label htmlFor="checkout">Check-out</Label>
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
              disabled={(date) => 
                date < (checkIn ? addDays(checkIn, 1) : new Date()) ||
                disabledDates.some(disabled => 
                  disabled.toDateString() === date.toDateString()
                )
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guests */}
      <div className="space-y-2">
        <Label htmlFor="guests">Guests</Label>
        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger>
            <SelectValue placeholder="Select number of guests" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>${property.price} × {nights} nights</span>
            <span>${property.price * nights}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !checkIn || !checkOut}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Booking...
          </>
        ) : (
          `Book Now - $${total}`
        )}
      </Button>
    </form>
  )
}