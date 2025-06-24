"use client"

import { useLoading } from "@/components/loading-provider"
import NextLink, { LinkProps as NextLinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { ReactNode, forwardRef } from "react"

interface LoadingLinkProps extends NextLinkProps {
  children: ReactNode
  className?: string
}

const LoadingLink = forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  ({ children, className, ...props }, ref) => {
    const { startLoading } = useLoading()
    
    const handleClick = () => {
      startLoading()
    }

    return (
      <NextLink
        {...props}
        ref={ref}
        className={className}
        onClick={handleClick}
      >
        {children}
      </NextLink>
    )
  }
)

LoadingLink.displayName = "LoadingLink"

export { LoadingLink }