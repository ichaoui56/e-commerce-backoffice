import { redirect } from "next/navigation"
import { CategoryManagement } from "@/components/category-management"
import { auth } from "@/auth"

export default async function CategoriesPage() {
    const session = await auth()
    if (!session) {
        redirect("/login")
    }

    return <CategoryManagement />
}