"use client"

import { useLoading } from "@/components/loading-provider"
import { Button, ButtonProps } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { forwardRef } from "react"

interface LoadingButtonProps extends ButtonProps {
  href?: string
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, href, onClick, ...props }, ref) => {
    const { startLoading } = useLoading()
    const router = useRouter()
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      startLoading()
      
      if (onClick) {
        onClick(e)
      }
      
      if (href) {
        router.push(href)
      }
    }

    return (
      <Button
        {...props}
        ref={ref}
        onClick={handleClick}
      >
        {children}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

export { LoadingButton }