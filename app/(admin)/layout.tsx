"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Extract active section from pathname
  const getActiveSection = () => {
    if (pathname.includes('/products')) return 'products'
    if (pathname.includes('/categories')) return 'categories'
    if (pathname.includes('/orders')) return 'orders'
    if (pathname.includes('/inventory')) return 'inventory'
    return 'dashboard'
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-gray-50/50">
        <AdminSidebar activeSection={getActiveSection()} setActiveSection={() => {}} />
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 bg-white border-b border-gray-200 px-4 lg">
            <SidebarTrigger className="h-8 w-8" />
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-lg text-gray-900">Shahine Store</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container-responsive py-4 sm:py-6 lg:py-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
