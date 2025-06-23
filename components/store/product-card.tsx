import type { Product, Category } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart } from "lucide-react"
import Image from "next/image"

interface ProductCardProps {
  product: Product & {
    category: Category | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {/* Quick actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Stock badge */}
        {product.stock === 0 && (
          <Badge className="absolute top-2 left-2" variant="destructive">
            Out of Stock
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          )}

          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>

          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <Button className="w-full" disabled={product.stock === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
