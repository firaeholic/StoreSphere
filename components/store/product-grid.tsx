import type { Product, Category } from "@prisma/client"
import { ProductCard } from "./product-card"

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

interface ProductGridProps {
  products: Product[]
  storeSlug: string
}

export function ProductGrid({ products, storeSlug }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products yet</h3>
        <p className="text-gray-600">This store is still setting up their products. Check back soon!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <div className="flex items-center space-x-4">
          <select className="border rounded-md px-3 py-2">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
        ))}
      </div>
    </div>
  )
}
