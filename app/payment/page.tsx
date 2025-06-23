import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { PaymentForm } from "@/components/payment/payment-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Store, ShoppingCart } from "lucide-react"
import { format } from "date-fns"

export default async function PaymentPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  if (!searchParams.orderId) {
    redirect("/")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Get the order
  const order = await prisma.order.findUnique({
    where: { id: searchParams.orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      store: true,
      customer: true,
    },
  })

  if (!order) {
    redirect("/")
  }

  // Verify the order belongs to the current user
  if (order.customerId !== user.id) {
    redirect("/")
  }

  // If order is already paid, redirect to success
  if (order.status === "COMPLETED") {
    redirect(`/order-confirmation?orderId=${order.id}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const serviceFee = order.totalAmount * 0.05 // 5% service fee
  const tax = order.totalAmount * 0.08 // 8% tax
  const finalTotal = order.totalAmount + serviceFee + tax

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
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  Review your order details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{order.store.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">Order #{order.id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">{format(order.createdAt, "PPP 'at' p")}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  {order.items.map((item) => {
                    const productImages = typeof item.product.images === 'string' ? JSON.parse(item.product.images || '[]') : item.product.images || []
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {productImages.length > 0 ? (
                            <img
                              src={productImages[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service fee (5%):</span>
                    <span>{formatPrice(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (8%):</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Orders are processed immediately upon payment</p>
                  <p>• Refunds available within 24 hours of order placement</p>
                  <p>• Contact store directly for order modifications</p>
                  <p>• Digital receipt will be sent to your email</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <PaymentForm 
              orderData={{
                orderId: order.id,
                storeName: order.store.name,
                finalTotal: finalTotal.toFixed(2),
                items: order.items
              }} 
              user={user} 
            />
          </div>
        </div>
      </main>
    </div>
  )
}