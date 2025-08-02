import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { InventoryManagement } from "@/components/inventory-management"

export default async function InventoryPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login")
  }

  return <InventoryManagement />
}
