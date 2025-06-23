"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Store, User, Product, Order } from "@prisma/client"
import { Eye, Edit, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"

type StoreWithRelations = Store & {
  owner: User
  products: Product[]
  orders: Order[]
}

interface StoresListProps {
  stores: StoreWithRelations[]
}

export function StoresList({ stores }: StoresListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Stores</h2>
        <p className="text-gray-600">{stores.length} total stores</p>
      </div>

      <div className="grid gap-6">
        {stores.map((store) => (
          <Card key={store.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {store.name}
                    <Badge variant={store.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {store.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {store.description || 'No description provided'}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Owner: {store.owner.email}</span>
                    <span>•</span>
                    <span>Created: {new Date(store.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/store/${store.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Store
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{store.products.length}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{store.orders.length}</div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${store.orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {store.orders.filter(order => order.status === 'PENDING').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stores.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No stores found</h3>
              <p>No stores have been created yet.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}