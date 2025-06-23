import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CreateStorePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      stores: true,
    },
  })

  // Allow creating multiple stores - remove the redirect

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/onboarding" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to onboarding
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Store
          </h1>
          <p className="text-gray-600">
            Fill in the details below to set up your online store
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Store Information
            </CardTitle>
            <CardDescription>
              This information will be displayed on your store's public page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/stores" method="POST" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Store Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="My Awesome Store"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Store URL *</Label>
                  <div className="flex">
                    <Input
                      id="slug"
                      name="slug"
                      placeholder="my-store"
                      className="rounded-r-none"
                      required
                    />
                    <div className="bg-gray-100 border border-l-0 rounded-r-md px-3 py-2 text-sm text-gray-600">
                      .storesphere.com
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your store's web address
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell customers about your store..."
                    rows={3}
                  />
                </div>



                <div>
                  <Label htmlFor="currency">Base Currency *</Label>
                  <Select name="currency" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Create Store
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/onboarding">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}