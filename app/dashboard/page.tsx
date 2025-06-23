import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentOrders } from "@/components/dashboard/recent-orders"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      store: {
        include: {
          products: true,
          orders: {
            include: {
              items: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
        },
      },
    },
  })

  if (!user) {
    redirect("/onboarding")
  }

  if (!user.store) {
    redirect("/create-store")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader store={user.store} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <DashboardStats store={user.store} />
          <RecentOrders orders={user.store.orders} />
        </div>
      </main>
    </div>
  )
}
