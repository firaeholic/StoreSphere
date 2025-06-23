import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, MapPin, Calendar, Users, Star, ArrowRight, Plus, Settings, Globe, CreditCard, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { AdminPromotion } from "@/components/admin/admin-promotion"

export default async function HomePage() {
  const { userId } = await auth()
  let user = null
  let userStores = []
  let properties = []

  // Fetch properties
  try {
    properties = await prisma.property.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
        owner: true,
        bookings: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 6
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
  }

  if (userId) {
    try {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          store: {
            include: {
              products: true,
              orders: true,
            },
          },
        },
      })

      if (user) {
        userStores = user.store ? [user.store] : []
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // Continue without user data if there's an error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">StoreSphere</span>
          </div>
          <div className="flex items-center space-x-4">
            {userId ? (
              <>
                {user?.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {userId ? (
            // Authenticated User Dashboard
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                  Welcome back!
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Manage your stores and explore new opportunities
                </p>
              </div>

              {/* User Stores */}
              {userStores.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Stores</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userStores.map((store) => (
                      <Card key={store.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Store className="h-5 w-5" />
                              {store.name}
                            </CardTitle>
                            <Badge variant={store.status === "ACTIVE" ? "default" : "secondary"}>
                              {store.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            {store.products?.length || 0} products • {store.orders?.length || 0} orders
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button asChild size="sm" className="flex-1">
                              <Link href={`/store/${store.subdomain}`}>
                                View Store
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <Link href="/dashboard">
                                Manage
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Properties */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Properties</h2>
                {properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <Card key={property.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={property.images[0]}
                                alt={property.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-gray-500">Property Image</span>
                            )}
                          </div>
                          <CardTitle className="flex items-center justify-between">
                            <span>{property.name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{property.rating?.toFixed(1) || 'N/A'}</span>
                            </div>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {property.location}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold">${property.price}</span>
                            <span className="text-gray-600">per night</span>
                          </div>
                          <Button asChild className="w-full">
                            <Link href={`/property/${property.id}`}>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <MapPin className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Available</h3>
                    <p className="text-gray-500 mb-6">There are currently no properties listed. Check back later!</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Button asChild className="h-auto p-6 flex flex-col items-start space-y-2">
                  <Link href="/dashboard">
                    <Settings className="h-6 w-6" />
                    <span className="font-semibold">Manage Stores</span>
                    <span className="text-sm opacity-90">Configure your stores and settings</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-start space-y-2">
                  <Link href="/dashboard/create-store">
                    <Plus className="h-6 w-6" />
                    <span className="font-semibold">Create New Store</span>
                    <span className="text-sm opacity-90">Start a new business venture</span>
                  </Link>
                </Button>
              </div>

              {/* Admin Promotion Section */}
              <div className="mt-8">
                <AdminPromotion user={user} />
              </div>
            </div>
          ) : (
            // Non-authenticated User Landing Page
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Build Your <span className="text-blue-600">Multi-Tenant</span> Empire
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Create unlimited stores with custom subdomains, integrated payments, and powerful analytics. 
                Perfect for entrepreneurs, agencies, and businesses looking to scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/sign-up">
                  <Button size="lg" className="text-lg px-8">
                    Start Your Store <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid - Only show for non-authenticated users */}
      {!userId && (
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to help you build, manage, and grow your online business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Globe className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle>Custom Subdomains</CardTitle>
                  <CardDescription>Get your own branded subdomain like yourstore.storesphere.com</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CreditCard className="h-12 w-12 text-green-600 mb-4" />
                  <CardTitle>Stripe Connect</CardTitle>
                  <CardDescription>Integrated payments with automatic payouts and split payments</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Users className="h-12 w-12 text-purple-600 mb-4" />
                  <CardTitle>Multi-Vendor</CardTitle>
                  <CardDescription>Support multiple vendors with isolated data and dashboards</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Shield className="h-12 w-12 text-red-600 mb-4" />
                  <CardTitle>Secure Authentication</CardTitle>
                  <CardDescription>Enterprise-grade security with Clerk authentication</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                  <CardTitle>Lightning Fast</CardTitle>
                  <CardDescription>Built with Next.js for optimal performance and SEO</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Globe className="h-12 w-12 text-indigo-600 mb-4" />
                  <CardTitle>Multi-Currency</CardTitle>
                  <CardDescription>Support for multiple currencies with real-time conversion</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show for non-authenticated users */}
      {!userId && (
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Launch Your Store?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful merchants who trust StoreSphere to power their online business.
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-6 w-6" />
              <span className="text-xl font-bold">StoreSphere</span>
            </div>
            <p className="text-gray-400">© 2024 StoreSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
