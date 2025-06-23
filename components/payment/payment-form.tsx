"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, Shield } from "lucide-react"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"

interface BookingData {
  propertyId: string
  propertyName: string
  checkIn: string
  checkOut: string
  guests: number
  rooms: number
  total: number
  finalTotal: string
}

interface PaymentFormProps {
  bookingData: BookingData
  user: User
}

export function PaymentForm({ bookingData, user }: PaymentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    billingAddress: "",
    city: "",
    zipCode: "",
    country: "US",
    agreeToTerms: false
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    handleInputChange('cardNumber', formatted)
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    handleInputChange('expiryDate', formatted)
  }

  const handlePayment = async () => {
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName) {
      alert("Please fill in all payment details")
      return
    }

    setIsLoading(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real app, you would:
      // 1. Create a Stripe payment intent
      // 2. Process the payment
      // 3. Save the booking to the database
      // 4. Send confirmation emails

      const paymentData = {
        bookingId: `booking_${Date.now()}`,
        ...bookingData,
        paymentMethod,
        paymentStatus: 'completed',
        paymentDate: new Date().toISOString(),
        userId: user.id
      }

      console.log('Payment processed:', paymentData)

      // Redirect to confirmation page
      router.push(`/booking-confirmation?booking=${encodeURIComponent(JSON.stringify(paymentData))}`)
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Your payment information is secure and encrypted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Credit/Debit Card
                </div>
              </SelectItem>
              <SelectItem value="paypal">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">PayPal</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === "card" && (
          <div className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleExpiryChange}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={formData.cardName}
                onChange={(e) => handleInputChange('cardName', e.target.value)}
              />
            </div>

            <Separator />

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="font-semibold">Billing Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Address</Label>
                <Input
                  id="billingAddress"
                  placeholder="123 Main Street"
                  value={formData.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "paypal" && (
          <div className="text-center py-8">
            <div className="text-blue-600 text-lg font-semibold mb-2">PayPal Payment</div>
            <p className="text-gray-600">You will be redirected to PayPal to complete your payment</p>
          </div>
        )}

        <Separator />

        {/* Terms and Conditions */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the terms and conditions
            </label>
            <p className="text-xs text-muted-foreground">
              By proceeding, you agree to our booking terms, cancellation policy, and privacy policy.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <Shield className="h-4 w-4 text-green-600" />
          <div className="text-sm text-green-700">
            <div className="font-medium">Secure Payment</div>
            <div>Your payment information is encrypted and secure</div>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment}
          disabled={isLoading || !formData.agreeToTerms}
          className="w-full"
          size="lg"
        >
          <Lock className="mr-2 h-4 w-4" />
          {isLoading ? "Processing Payment..." : `Pay $${bookingData.finalTotal}`}
        </Button>
      </CardContent>
    </Card>
  )
}