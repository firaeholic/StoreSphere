"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Crown, AlertTriangle } from "lucide-react"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"

interface AdminPromotionProps {
  user: User | null
}

export function AdminPromotion({ user }: AdminPromotionProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPromoted, setIsPromoted] = useState(user?.role === "ADMIN")

  // Don't render if user is null
  if (!user) {
    return null
  }

  const handlePromotion = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'promote-self' }),
      })

      const data = await response.json()

      if (data.success) {
        setIsPromoted(true)
        // Refresh the page to update the UI
        router.refresh()
      } else {
        alert(data.error || 'Failed to promote user')
      }
    } catch (error) {
      console.error('Promotion error:', error)
      alert('Failed to promote user')
    } finally {
      setIsLoading(false)
    }
  }

  if (isPromoted) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-yellow-900">Admin Access Granted</span>
                <Badge variant="default" className="bg-yellow-600">
                  ADMIN
                </Badge>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You now have access to the admin dashboard and can manage the platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Admin Access
        </CardTitle>
        <CardDescription>
          Promote yourself to admin to access advanced features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">Demo Feature</p>
            <p className="text-amber-700">
              In this demo, any user can promote themselves to admin. In a production environment, 
              admin access would be granted through proper authorization processes.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Admin privileges include:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Access to admin dashboard</li>
            <li>• Manage all stores and users</li>
            <li>• View platform analytics</li>
            <li>• Configure system settings</li>
            <li>• Moderate content and users</li>
          </ul>
        </div>

        <Button 
          onClick={handlePromotion}
          disabled={isLoading}
          className="w-full"
        >
          <Crown className="mr-2 h-4 w-4" />
          {isLoading ? "Promoting..." : "Promote to Admin"}
        </Button>
      </CardContent>
    </Card>
  )
}