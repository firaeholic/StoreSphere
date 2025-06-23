import type { Store } from "@prisma/client"
import Image from "next/image"

interface StoreHeroProps {
  store: Store
}

export function StoreHero({ store }: StoreHeroProps) {
  if (!store.banner) return null

  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      <Image src={store.banner || "/placeholder.svg"} alt={`${store.name} banner`} fill className="object-cover" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute bottom-8 left-8 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Welcome to {store.name}</h2>
        {store.description && <p className="text-lg opacity-90 max-w-2xl">{store.description}</p>}
      </div>
    </div>
  )
}
