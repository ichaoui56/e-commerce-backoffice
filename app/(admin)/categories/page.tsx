import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CategoryManagement } from "@/components/category-management"

export default async function CategoriesPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login")
  }

  return <CategoryManagement />
}