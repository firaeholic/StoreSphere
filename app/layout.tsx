import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import "./globals.css"
import { LoadingProvider } from "@/components/loading-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "StoreSphere - Multi-Vendor E-Commerce Platform",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
