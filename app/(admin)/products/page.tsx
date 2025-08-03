import { redirect } from "next/navigation"
import { ProductManagement } from "@/components/product-management"
import { auth } from "@/auth"

export default async function ProductsPage() {
  const session = await auth()
  
      if (!session) {
          redirect("/login")
      }

  return <ProductManagement />
}