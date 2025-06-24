import { auth, createClerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Globe, Shield, Database } from "lucide-react"

export default async function AdminSettingsPage() {
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

  // Get platform statistics
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  const clerkUsers = await clerkClient.users.getUserList({ limit: 1000 })
  const totalUsers = clerkUsers.data.length
  const totalStores = await prisma.store.count()
  const totalProducts = await prisma.product.count()
  const totalOrders = await prisma.order.count()

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-gray-600">Manage global platform configuration and settings</p>
            </div>
          </div>

          {/* Platform Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Platform Statistics
              </CardTitle>
              <CardDescription>
                Overview of platform usage and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalStores}</div>
                  <div className="text-sm text-gray-600">Total Stores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalProducts}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{totalOrders}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Authentication & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication & Security
              </CardTitle>
              <CardDescription>
                Manage user authentication and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Clerk Dashboard</h4>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Security settings, user authentication, and notification preferences are managed through the Clerk dashboard.
                </p>
                <Button asChild variant="outline" size="sm">
                  <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer">
                    Open Clerk Dashboard
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>


        </div>
      </main>
    </div>
  )
}