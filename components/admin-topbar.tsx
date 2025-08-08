"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Store } from 'lucide-react'

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center gap-3 px-3 sm:px-4 h-14">
        <SidebarTrigger />
        <div className="flex items-center gap-2 sm:hidden">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#e94491] to-[#d63384] flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold">Shahine Store</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Reserved for future actions (e.g., theme toggle, user menu) */}
        </div>
      </div>
    </header>
  )
}
