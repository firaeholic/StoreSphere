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

  // For localhost development, check if there's a subdomain-like pattern
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1")
  
  // Handle subdomain routing for tenants (works for both production and localhost)
  if (!isLocalhost && subdomain && subdomain !== "www" && subdomain !== "admin") {
    // Rewrite to tenant-specific pages for production subdomains
    url.pathname = `/store/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }
  
  // For localhost, check if the path starts with /store/[tenant] to handle tenant routing
  if (isLocalhost && url.pathname.startsWith('/store/') && url.pathname.split('/').length > 2) {
    // Allow the request to proceed normally for localhost tenant routes
    // This handles URLs like localhost:3000/store/vendor1
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
