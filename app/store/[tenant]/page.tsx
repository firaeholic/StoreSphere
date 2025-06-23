import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { StoreHeader } from "@/components/store/store-header"
import { ProductGrid } from "@/components/store/product-grid"
import { StoreHero } from "@/components/store/store-hero"

interface StorePageProps {
  params: {
    tenant: string
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const store = await prisma.store.findUnique({
    where: { slug: params.tenant },
    include: {
      products: {
        where: { status: "ACTIVE" },
        orderBy: {
          createdAt: "desc"
        }
      },
      owner: true
    },
  })

  if (!store || store.status !== "ACTIVE") {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader store={store} />
      <StoreHero store={store} />
      <main className="container mx-auto px-4 py-8">
        <ProductGrid products={store.products} storeSlug={store.slug} />
      </main>
    </div>
  )
}
