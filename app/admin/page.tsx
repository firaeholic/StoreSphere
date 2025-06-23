import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { StoresList } from "@/components/admin/stores-list"

export default async function AdminPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  const stores = await prisma.store.findMany({
    include: {
      owner: true,
      products: true,
      orders: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const totalUsers = await prisma.user.count()
  const totalOrders = await prisma.order.count()
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      total: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <AdminStats
            totalStores={stores.length}
            totalUsers={totalUsers}
            totalOrders={totalOrders}
            totalRevenue={totalRevenue._sum.total || 0}
          />
          <StoresList stores={stores} />
        </div>
      </main>
    </div>
  )
}
