import type { Product, Category } from "@prisma/client"
'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  images: string
  stock: number
  status: string
  storeId: string
  createdAt: Date
  updatedAt: Date
}

interface ProductCardProps {
  product: Product
  storeSlug: string
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [isOrdering, setIsOrdering] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleOrder = async () => {
    if (quantity <= 0 || quantity > product.stock) {
      toast.error('Invalid quantity')
      return
    }

    setIsOrdering(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          storeSlug
        }),
      })

      if (response.ok) {
        const order = await response.json()
        toast.success('Order placed successfully!')
        // Redirect to payment
        window.location.href = `/payment?orderId=${order.id}`
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order')
    } finally {
      setIsOrdering(false)
    }
  }

  const productImages = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : product.images || []

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {productImages.length > 0 ? (
          <img
            src={productImages[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Stock badge */}
        {product.stock === 0 && (
          <Badge className="absolute top-2 left-2" variant="destructive">
            Out of Stock
          </Badge>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <Badge className="absolute top-2 left-2" variant="secondary">
            Only {product.stock} left
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            <Badge variant="outline">{product.stock} in stock</Badge>
          </div>

          {product.stock > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center"
                  min="1"
                  max={product.stock}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button 
                className="w-full" 
                onClick={handleOrder}
                disabled={isOrdering || quantity <= 0 || quantity > product.stock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isOrdering ? 'Ordering...' : `Order ${formatPrice(product.price * quantity)}`}
              </Button>
            </div>
          )}

          {product.stock === 0 && (
            <Button className="w-full" disabled>
              Out of Stock
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
