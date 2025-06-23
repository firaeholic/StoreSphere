"use client"

import type { Store } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Settings, Plus, Home, Store, Package } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  store: Store
}

export function DashboardHeader({ store }: DashboardHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "SUSPENDED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
              <Badge className={getStatusColor(store.status)}>{store.status}</Badge>
            </div>
            <p className="text-gray-600">Manage your store and track your performance</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/dashboard/stores">
              <Button variant="outline" size="sm">
                <Store className="h-4 w-4 mr-2" />
                My Stores
              </Button>
            </Link>
            <Link href={`/store/${store.slug}`} target="_blank">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Store
              </Button>
            </Link>
            <Link href={`/dashboard/products?store=${store.slug}`}>
              <Button variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
            </Link>
            <Link href={`/dashboard/products/new?store=${store.slug}`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Link href={`/dashboard/settings?store=${store.slug}`}>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
