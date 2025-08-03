import { redirect } from "next/navigation"
import { OrderManagement } from "@/components/order-management"
import { auth } from "@/auth"

export default async function OrdersPage() {
  const session = await auth()
  
      if (!session) {
          redirect("/login")
      }

  return <OrderManagement />
}