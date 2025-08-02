import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OrderManagement } from "@/components/order-management"

export default async function OrdersPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login")
  }

  return <OrderManagement />
}