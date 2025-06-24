import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Store, Search, ShoppingCart, Users, Star, ArrowRight, Plus, Settings, Globe, CreditCard, Shield, Zap, Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github, Heart, TrendingUp, Award, Clock } from "lucide-react"
import Link from "next/link"
import { LoadingLink } from "@/components/ui/loading-link"
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { AdminPromotion } from "@/components/admin/admin-promotion"

export default async function HomePage() {
  const { userId } = await auth()
  let user = null
  let userStores = []
  let products = []

  // Fetch available products from all stores
  try {
    products = await prisma.product.findMany({
      where: {
        status: "ACTIVE"
      },
      include: {
        store: {
          select: {
            name: true,
            slug: true,
            ownerId: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 12
    })
  } catch (error) {
    console.error('Error fetching products:', error)
  }

  if (userId) {
    try {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          stores: {
            include: {
              products: true,
              orders: true,
            },
          },
        },
      })

      if (user) {
        userStores = user.stores || []
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // Continue without user data if there's an error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Store className="h-8 w-8 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">StoreSphere</span>
          </Link>
          <div className="flex items-center space-x-4">
            {userId ? (
              <>
                {user?.role === "ADMIN" && (
                  <LoadingLink href="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </LoadingLink>
                )}
                {userStores.length > 0 && (
                  <LoadingLink href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </LoadingLink>
                )}
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <LoadingLink href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </LoadingLink>
                <LoadingLink href="/sign-up">
                  <Button>Get Started</Button>
                </LoadingLink>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          {userId ? (
            // Authenticated User Dashboard
            <div className="space-y-8">
              <div className="text-center animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 animate-slide-up">
                  Welcome back!
                </h1>
                <p className="text-xl text-gray-600 mb-8 animate-slide-up delay-200">
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
                              <LoadingLink href={`/dashboard?store=${store.slug}`}>
                                View Store
                              </LoadingLink>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <LoadingLink href={`/dashboard/settings?store=${store.slug}`}>
                                Manage
                              </LoadingLink>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Products */}
              <div className="mb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10"
                      id="product-search"
                    />
                  </div>
                </div>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="products-grid">
                    {products.map((product) => {
                      const isOwnProduct = user && product.store.ownerId === user.id;
                      const productImages = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : product.images || [];
                      
                      return (
                        <Card key={product.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                              {productImages.length > 0 ? (
                                <img
                                  src={productImages[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-12 w-12 text-gray-400" />
                              )}
                            </div>
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Store className="h-4 w-4" />
                              {product.store.name}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-2xl font-bold">${product.price}</span>
                              <Badge variant="secondary">{product.stock} in stock</Badge>
                            </div>
                            {product.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                            )}
                            {isOwnProduct ? (
                              <Button disabled className="w-full" variant="outline">
                                Your Product
                              </Button>
                            ) : (
                              <Button asChild className="w-full">
                                <Link href={`/store/${product.store.slug}?product=${product.slug}`}>
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Order Now
                                </Link>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Package className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Available</h3>
                    <p className="text-gray-500 mb-6">There are currently no products listed. Check back later!</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Button asChild className="h-auto p-6 flex flex-col items-start space-y-2">
                  <LoadingLink href="/dashboard/stores">
                    <Settings className="h-6 w-6" />
                    <span className="font-semibold">Manage Stores</span>
                    <span className="text-sm opacity-90">Configure your stores and settings</span>
                  </LoadingLink>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-6 flex flex-col items-start space-y-2">
                  <LoadingLink href="/create-store">
                    <Plus className="h-6 w-6" />
                    <span className="font-semibold">Create New Store</span>
                    <span className="text-sm opacity-90">Start a new business venture</span>
                  </LoadingLink>
                </Button>
              </div>

              {/* Admin Promotion Section */}
              <div className="mt-8">
                <AdminPromotion user={user} />
              </div>
            </div>
          ) : (
            // Non-authenticated User Landing Page
            <div className="text-center relative z-10">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
                  <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Build Your</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">Multi-Tenant</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">Empire</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed animate-slide-up delay-200">
                  Create unlimited stores with custom subdomains, integrated payments, and powerful analytics. 
                  Perfect for entrepreneurs, agencies, and businesses looking to scale their digital presence.
                </p>
                
                {/* Stats Section */}
                <div className="flex flex-wrap justify-center gap-8 mb-12 animate-slide-up delay-300">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10K+</div>
                    <div className="text-sm text-gray-500">Active Stores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">$2M+</div>
                    <div className="text-sm text-gray-500">Revenue Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">99.9%</div>
                    <div className="text-sm text-gray-500">Uptime</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up delay-400">
                  <LoadingLink href="/sign-up">
                    <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Start Your Store <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </LoadingLink>
                  <LoadingLink href="/sign-in">
                    <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transform hover:scale-105 transition-all duration-300">
                      Sign In
                    </Button>
                  </LoadingLink>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 animate-slide-up delay-500">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Enterprise Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">99.9% Uptime SLA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid - Only show for non-authenticated users */}
      {!userId && (
        <section className="py-20 px-4 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Everything You Need to Succeed
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Powerful features designed to help you build, manage, and grow your online business with enterprise-grade tools.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/50 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Custom Subdomains</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Get your own branded subdomain like yourstore.storesphere.com with SSL certificates included
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-green-50/50 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Stripe Connect</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Integrated payments with automatic payouts, split payments, and comprehensive financial reporting
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50/50 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Multi-Vendor Platform</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Support unlimited vendors with isolated data, custom dashboards, and role-based permissions
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-red-50/50 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Enterprise Security</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Bank-grade security with Clerk authentication, data encryption, and compliance standards
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-yellow-50/50 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Lightning Performance</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Built with Next.js 14 for optimal performance, SEO optimization, and blazing-fast load times
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white to-indigo-50/50 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">Advanced Analytics</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Comprehensive analytics dashboard with real-time insights, conversion tracking, and growth metrics
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show for non-authenticated users */}
      {!userId && (
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/80 via-purple-600/80 to-pink-600/80"></div>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse delay-500"></div>
          </div>
          
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-slide-up">
              Ready to Launch Your <span className="text-yellow-300">Dream Store</span>?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-200">
              Join thousands of successful merchants who trust StoreSphere to power their online business. 
              Start your journey today with our free plan.
            </p>
            
            {/* Social proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-8 animate-slide-up delay-300">
              <div className="flex items-center gap-2 text-blue-100">
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Users className="h-5 w-5 text-yellow-300" />
                <span className="text-sm">10,000+ Happy Users</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Heart className="h-5 w-5 text-yellow-300 fill-current" />
                <span className="text-sm">99% Satisfaction</span>
              </div>
            </div>
            
            <div className="animate-slide-up delay-400">
              <LoadingLink href="/sign-up">
                <Button size="lg" className="text-lg px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl font-semibold">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </LoadingLink>
              <p className="text-sm text-blue-200 mt-4">No credit card required • Free forever plan available</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <Store className="h-8 w-8 text-blue-400" />
                  <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 blur-sm"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">StoreSphere</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering entrepreneurs worldwide with cutting-edge e-commerce solutions. Build, scale, and succeed with our multi-tenant platform.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors duration-300">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">Features</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">Templates</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">Integrations</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">API Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">Changelog</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">Press Kit</a></li>
                <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">Partners</a></li>
                <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">Investors</a></li>
                <li><a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-300">News</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
              <ul className="space-y-3 mb-6">
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300">Community</a></li>
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300">Status Page</a></li>
                <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300">Contact Us</a></li>
              </ul>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">support@storesphere.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="h-4 w-4 text-green-400" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="h-4 w-4 text-red-400" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Newsletter Signup */}
          <div className="border-t border-gray-700 pt-8 mb-8">
            <div className="max-w-md mx-auto text-center">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Stay Updated
              </h3>
              <p className="text-gray-300 mb-4">Get the latest updates, tips, and exclusive offers delivered to your inbox.</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                />
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Cookie Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-300">GDPR</a>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-gray-400 text-sm">© 2024 StoreSphere. All rights reserved.</p>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <span>Made with</span>
                  <Heart className="h-4 w-4 text-red-400 fill-current" />
                  <span>in San Francisco</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
