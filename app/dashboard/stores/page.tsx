"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Store, Settings, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Store {
  id: number
  name: string
  slug: string
  description: string | null
  status: string
  currency: string
  createdAt: string
  _count: {
    products: number
    orders: number
  }
}

export default function StoresPage() {
  const { userId } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchStores()
    }
  }, [userId])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Stores</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">My Stores</h1>
        </div>
        <Link href="/create-store">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Store
          </Button>
        </Link>
      </div>

      {stores.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stores yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first store to start selling products
            </p>
            <Link href="/create-store">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Store
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{store.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      /{store.slug}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(store.status)}>
                    {store.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {store.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {store.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Products:</span>
                      <span className="ml-1">{store._count.products}</span>
                    </div>
                    <div>
                      <span className="font-medium">Orders:</span>
                      <span className="ml-1">{store._count.orders}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Currency:</span>
                    <span className="ml-1">{store.currency}</span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Created:</span>
                    <span className="ml-1">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Link href={`/dashboard?store=${store.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Store
                      </Button>
                    </Link>
                    <Link href={`/dashboard/settings?store=${store.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}