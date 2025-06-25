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
      <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Crown className="h-10 w-10 text-yellow-600 z-10 relative" />
              <div className="absolute inset-0 bg-yellow-500 rounded-full opacity-20 blur-sm animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xl bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text text-transparent">Admin Access Granted</span>
                <Badge variant="default" className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-semibold">
                  ADMIN
                </Badge>
              </div>
              <p className="text-amber-700 mt-1">
                You now have access to the admin dashboard and can manage the platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Admin Access</span>
        </CardTitle>
        <CardDescription className="text-blue-700">
          Contact an administrator for promotion to access advanced features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Admin privileges include:</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">• Access to admin dashboard</li>
            <li className="flex items-center gap-2">• Manage all stores and users</li>
            <li className="flex items-center gap-2">• View platform analytics</li>
            <li className="flex items-center gap-2">• Configure system settings</li>
            <li className="flex items-center gap-2">• Moderate content and users</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}