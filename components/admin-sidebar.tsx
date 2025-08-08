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
  useSidebar,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Package, FolderOpen, ShoppingCart, Warehouse, Users, LogOut, Store } from 'lucide-react'
import { useRouter, usePathname } from "next/navigation"
import { SignOut } from "./sign-out"

interface AdminSidebarProps {
  activeSection?: string
  setActiveSection?: (section: string) => void
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
  const { setOpenMobile, isMobile } = useSidebar()

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
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar className="bg-white border-r border-gray-200 sidebar-transition">
      <SidebarHeader className="bg-white border-b border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="">
            <img src="logo-shahine.png" alt="" className="w-10" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">Shahine Store</h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">Admin Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 sm:p-4 bg-white">
        {menuItems.map((group) => (
          <SidebarGroup key={group.title} className="mb-4 sm:mb-6">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item)}
                      isActive={currentActiveSection === item.key}
                      className={`w-full justify-start gap-3 px-3 py-3 sm:py-2 rounded-lg transition-all duration-200 cursor-pointer min-h-[44px] sm:min-h-[36px] ${currentActiveSection === item.key
                          ? "bg-[#e94491] text-white hover:bg-[#d63384] shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={`ml-auto text-xs flex-shrink-0 ${currentActiveSection === item.key
                              ? "bg-white/20 text-white"
                              : "bg-[#e94491] text-white"
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

      <SidebarFooter className="border-t border-gray-100 p-3 sm:p-4 bg-white">
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-600 truncate">admin@shahinestore.com</p>
            </div>
          </div>
          <SignOut />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}