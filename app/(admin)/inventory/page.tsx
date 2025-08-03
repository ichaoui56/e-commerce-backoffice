import { redirect } from "next/navigation"
import { InventoryManagement } from "@/components/inventory-management"
import { auth } from "@/auth"

export default async function InventoryPage() {
const session = await auth()

    if (!session) {
        redirect("/login")
    }
  return <InventoryManagement />
}
