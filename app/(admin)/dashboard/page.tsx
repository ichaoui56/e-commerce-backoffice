import { getAuthUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardOverview } from "@/components/dashboard-overview"

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login")
  }

  return <DashboardOverview />
}