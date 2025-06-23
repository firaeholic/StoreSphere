import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Store, User, Building } from "lucide-react"

export default async function OnboardingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      store: true,
    },
  })

  if (user?.store) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to StoreSphere!
          </h1>
          <p className="text-gray-600">
            Let's get you set up with your online store
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Store className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Create Your Store</CardTitle>
              <CardDescription>
                Set up your own online store and start selling products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create-store" className="w-full">
                <Button className="w-full">
                  Create Store
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <User className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Browse Stores</CardTitle>
              <CardDescription>
                Explore existing stores and discover amazing products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Browse Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  )
}