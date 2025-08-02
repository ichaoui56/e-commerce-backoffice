"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Warehouse, Users, LogOut, Store } from "lucide-react"
import { logoutAdmin } from "@/lib/server-actions"
import { useRouter, usePathname } from "next/navigation"

interface AdminSidebarProps {
  activeSection?: string // Made optional since we derive it from pathname
  setActiveSection?: (section: string) => void // Made optional for backward compatibility
}

const menuItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        key: "dashboard",
        href: "/dashboard",
        badge: null,
      },
    ],
  },
  {
    title: "Catalog Management",
    items: [
      {
        title: "Products",
        icon: Package,
        key: "products",
        href: "/products",
        badge: null,
      },
      {
        title: "Categories",
        icon: FolderOpen,
        key: "categories",
        href: "/categories",
        badge: null,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Orders",
        icon: ShoppingCart,
        key: "orders",
        href: "/orders",
        badge: "3",
      },
      {
        title: "Inventory",
        icon: Warehouse,
        key: "inventory",
        href: "/inventory",
        badge: null,
      },
    ],
  },
]

export function AdminSidebar({ activeSection, setActiveSection }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Determine active section from pathname if not provided
  const getCurrentActiveSection = () => {
    if (activeSection) return activeSection
    
    if (pathname.includes('/products')) return 'products'
    if (pathname.includes('/categories')) return 'categories'
    if (pathname.includes('/orders')) return 'orders'
    if (pathname.includes('/inventory')) return 'inventory'
    return 'dashboard'
  }

  const currentActiveSection = getCurrentActiveSection()

  const handleNavigation = (item: any) => {
    // Use setActiveSection if provided (for backward compatibility)
    if (setActiveSection) {
      setActiveSection(item.key)
    }
    
    // Navigate to the new route
    if (item.href) {
      router.push(item.href)
    }
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#e94491] to-[#d63384] rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Shahine Store</h2>
            <p className="text-sm text-gray-600">Admin Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item)}
                      isActive={currentActiveSection === item.key}
                      className={`w-full justify-start gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        currentActiveSection === item.key
                          ? "bg-[#e94491] text-white hover:bg-[#d63384]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={`ml-auto text-xs ${
                            currentActiveSection === item.key ? "bg-white/20 text-white" : "bg-[#e94491] text-white"
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-600">admin@shahinestore.com</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => logoutAdmin()}
            className="w-full justify-start gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}