import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, Store, Calendar, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface OrderConfirmationPageProps {
  searchParams: {
    orderId?: string
  }
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { userId } = auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const { orderId } = searchParams

  if (!orderId) {
    redirect("/")
  }

  // Fetch order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true
        }
      },
      store: true,
      user: true
    }
  })

  if (!order) {
    redirect("/")
  }

  // Verify the order belongs to the user
  if (order.userId !== userId) {
    redirect("/")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const serviceFee = order.totalAmount * 0.05
  const tax = order.totalAmount * 0.08
  const finalTotal = order.finalAmount || (order.totalAmount + serviceFee + tax)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Message */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-green-900">
                    Order Confirmed!
                  </h2>
                  <p className="text-green-700">
                    Thank you for your order. We've received your payment and your order is being processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
                <CardDescription>
                  Order #{order.id.slice(-8)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{order.store.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Ordered on {format(order.createdAt, "PPP 'at' p")}</span>
                </div>

                {order.paymentDate && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>Paid on {format(order.paymentDate, "PPP 'at' p")}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Status: <span className="font-medium text-green-600">{order.status}</span></span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Items Ordered:</h4>
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
                          <h5 className="font-medium">{item.product.name}</h5>
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
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
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
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Paid:</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {order.paymentMethod && (
                  <div className="pt-4">
                    <p className="text-sm text-gray-600">
                      Payment Method: <span className="font-medium capitalize">{order.paymentMethod}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/store/${order.store.slug}`}>
                Visit Store
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}