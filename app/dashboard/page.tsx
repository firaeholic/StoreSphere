import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentOrders } from "@/components/dashboard/recent-orders"

interface DashboardPageProps {
  searchParams: {
    store?: string
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      stores: {
        include: {
          products: true,
          orders: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      name: true
                    }
                  }
                }
              },
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: "desc"
            },
            take: 5
          }
        },
      },
    },
  })

  if (!user) {
    redirect("/onboarding")
  }

  // If no stores exist, redirect to create store
  if (!user.stores || user.stores.length === 0) {
    redirect("/create-store")
  }

  // If store parameter is provided, find that specific store
  let selectedStore = null
  if (searchParams.store) {
    selectedStore = user.stores.find(store => store.slug === searchParams.store)
    if (!selectedStore) {
      redirect("/dashboard/stores")
    }
  } else {
    // If no store specified and user has multiple stores, redirect to store selection
    if (user.stores.length > 1) {
      redirect("/dashboard/stores")
    }
    // If user has only one store, use it
    selectedStore = user.stores[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader store={selectedStore} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <DashboardStats store={selectedStore} />
          <RecentOrders orders={selectedStore.orders} />
        </div>
      </main>
    </div>
  )
}
