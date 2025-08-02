import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProductManagement } from "@/components/product-management"

export default async function ProductsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login")
  }

  return <ProductManagement />
}