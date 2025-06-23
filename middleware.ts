import { type NextRequest, NextResponse } from "next/server"
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/exchange-rates",
  "/api/convert",
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl.clone()
  const hostname = req.headers.get("host") || ""

  // Extract subdomain
  const subdomain = hostname.split(".")[0]

  // Skip middleware for localhost and main domain
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return NextResponse.next()
  }

  // Handle subdomain routing for tenants
  if (subdomain && subdomain !== "www" && subdomain !== "admin") {
    // Rewrite to tenant-specific pages
    url.pathname = `/store/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Handle admin subdomain
  if (subdomain === "admin") {
    url.pathname = `/admin${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
