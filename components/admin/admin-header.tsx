import { Button } from "@/components/ui/button"
import { Shield, Settings, Users, Store } from "lucide-react"
import Link from "next/link"

export function AdminHeader() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage the StoreSphere platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/admin/users">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
            </Link>
            <Link href="/admin/stores">
              <Button variant="outline">
                <Store className="h-4 w-4 mr-2" />
                Stores
              </Button>
            </Link>
            <Link href="/admin/settings">
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
