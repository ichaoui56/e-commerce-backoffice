import { redirect } from "next/navigation"
import { DashboardOverview } from "@/components/dashboard-overview"
import { auth } from "@/auth"

export default async function DashboardPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    return <DashboardOverview />
}