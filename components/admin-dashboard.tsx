"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ProductManagement } from "@/components/product-management"
import { CategoryManagement } from "@/components/category-management"
import { OrderManagement } from "@/components/order-management"
import { InventoryManagement } from "@/components/inventory-management"

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />
      case "products":
        return <ProductManagement />
      case "categories":
        return <CategoryManagement />
      case "orders":
        return <OrderManagement />
      case "inventory":
        return <InventoryManagement />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50/50">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-6 lg:p-8">{renderContent()}</main>
      </div>
    </SidebarProvider>
  )
}
