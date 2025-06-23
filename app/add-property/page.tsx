import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AddPropertyForm } from "@/components/property/add-property-form"

export default async function AddPropertyPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Your Property</h1>
            <p className="text-gray-600">
              List your property and start earning by hosting guests
            </p>
          </div>

          <AddPropertyForm />
        </div>
      </div>
    </div>
  )
}