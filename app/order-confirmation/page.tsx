import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, Store, Calendar, User, CreditCard, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { LoadingLink } from "@/components/ui/loading-link"
import { format } from "date-fns"

interface OrderConfirmationPageProps {
  searchParams: {
    orderId?: string
  }
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const { orderId } = searchParams

  if (!orderId) {
    redirect("/")
  }

  // Fetch order details
  const order = await prisma.order.findUnique({
    where: { id: Number(searchParams.orderId) },
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

  // Verify the order belongs to the user
  // if (order.customerId != userId) {
  //   redirect("/")
  // }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const serviceFee = order.items.reduce((total, item) => total + (item.price * item.quantity), 0) * 0.05 // 5% service fee
  const tax = order.items.reduce((total, item) => total + (item.price * item.quantity), 0) * 0.08 // 8% tax
  const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  const finalTotal = subtotal + serviceFee + tax

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="flex items-center space-x-3 group mr-6">
            <div className="relative">
              <Store className="h-7 w-7 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">StoreSphere</span>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Order Confirmation</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Message */}
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                  <div className="absolute inset-0 bg-green-600 rounded-full opacity-20 blur-sm animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
                    Order Confirmed!
                  </h2>
                  <p className="text-green-700 text-lg">
                    Thank you for your order. We've received your payment and your order is being processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Order Details */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 animate-slide-up delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">Order Details</span>
                </CardTitle>
                <CardDescription>
                  Order #{order.id.toString().padStart(8, '0')}
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

                {order.createdAt && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>Paid on {format(order.createdAt, "PPP 'at' p")}</span>
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
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 animate-slide-up delay-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">Payment Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
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

                {/* {order.paymentMethod && (
                  <div className="pt-4">
                    <p className="text-sm text-gray-600">
                      Payment Method: <span className="font-medium capitalize">{order.paymentMethod}</span>
                    </p>
                  </div>
                )} */}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-400">
            <LoadingLink href="/" className="flex-1 sm:flex-none">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-6 py-2">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </LoadingLink>
            <LoadingLink href={`/store/${order.store.slug}`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transform hover:scale-105 transition-all duration-300 px-6 py-2">
                <Store className="h-4 w-4 mr-2" />
                Visit Store
              </Button>
            </LoadingLink>
          </div>
        </div>
      </main>
    </div>
  )
}