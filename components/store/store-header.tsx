import type { Store, User } from "@prisma/client"
import { ShoppingCart, Search, Heart, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface StoreHeaderProps {
  store: Store & {
    owner: User
  }
}

export function StoreHeader({ store }: StoreHeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {store.logo ? (
              <Image
                src={store.logo || "/placeholder.svg"}
                alt={store.name}
                width={40}
                height={40}
                className="rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{store.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
              {store.description && <p className="text-sm text-gray-600">{store.description}</p>}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <UserIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
