"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { usePathname } from "next/navigation"

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50/50">
        <AdminSidebar 
          activeSection={getActiveSection()} 
          setActiveSection={() => {}} // This will now be handled by navigation
        />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
