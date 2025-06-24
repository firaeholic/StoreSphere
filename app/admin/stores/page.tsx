import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Store, Package, ShoppingCart, DollarSign } from "lucide-react"
import { EditStoreButton } from "@/components/admin/edit-store-button"
import { DeleteStoreButton } from "@/components/admin/delete-store-button"

export default async function AdminStoresPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/")
  }

  const stores = await prisma.store.findMany({
    include: {
      owner: true,
      products: true,
      orders: {
        include: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const totalStores = stores.length
  const activeStores = stores.filter(store => store.status === "ACTIVE").length
  const totalProducts = stores.reduce((sum, store) => sum + store.products.length, 0)
  const totalRevenue = stores.reduce((sum, store) => {
    return sum + store.orders.reduce((orderSum, order) => {
      return orderSum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0)
    }, 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStores}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStores}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Stores Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Stores</CardTitle>
              <CardDescription>
                Manage all stores on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => {
                    const storeRevenue = store.orders.reduce((sum, order) => {
                      return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0)
                    }, 0)
                    return (
                      <TableRow key={store.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <Store className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{store.name}</div>
                              <div className="text-sm text-gray-500">{store.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {store.owner.firstName} {store.owner.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{store.owner.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={store.status === "ACTIVE" ? "default" : "secondary"}>
                            {store.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{store.products.length}</TableCell>
                        <TableCell>{store.orders.length}</TableCell>
                        <TableCell>${storeRevenue.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(store.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <EditStoreButton store={{...store, id: store.id.toString(), domain: store.slug}} />
                            <DeleteStoreButton storeId={store.id.toString()} storeName={store.name} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}