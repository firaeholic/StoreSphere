'use client'

import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PromoteUserButtonProps {
  userId: string
}

export function PromoteUserButton({ userId }: PromoteUserButtonProps) {
  const [isPromoting, setIsPromoting] = useState(false)

  const handlePromote = async () => {
    setIsPromoting(true)
    try {
      const response = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        toast.success('User promoted to admin successfully!')
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to promote user')
      }
    } catch (error) {
      console.error('Error promoting user:', error)
      toast.error('Failed to promote user')
    } finally {
      setIsPromoting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Crown className="h-4 w-4 mr-2" />
          Promote to Admin
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promote User to Admin</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to promote this user to admin? This will give them full access to the admin dashboard and all administrative functions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePromote} disabled={isPromoting}>
            {isPromoting ? 'Promoting...' : 'Promote to Admin'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}