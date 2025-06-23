import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Order } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Eye, Package, User } from "lucide-react"

interface OrderWithItems extends Order {
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
  customer: {
    firstName: string | null
    lastName: string | null
    email: string
  }
}

interface RecentOrdersProps {
  orders: OrderWithItems[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Your latest customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Orders will appear here once customers start purchasing
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getCustomerName = (order: OrderWithItems) => {
    const { firstName, lastName, email } = order.customer
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    if (firstName) {
      return firstName
    }
    return email
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recent Orders
        </CardTitle>
        <CardDescription>
          Your latest customer orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium">#{order.id.slice(-8)}</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>{getCustomerName(order)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                  <span className="mx-2">•</span>
                  <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                </div>
                {order.items.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {order.items.slice(0, 2).map((item, index) => (
                      <span key={item.id}>
                        {item.quantity}x {item.product.name}
                        {index < Math.min(order.items.length, 2) - 1 && ', '}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span> +{order.items.length - 2} more</span>
                    )}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/order-confirmation?orderId=${order.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>
            </div>
          ))}
        </div>
        {orders.length >= 5 && (
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">
                View All Orders
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}