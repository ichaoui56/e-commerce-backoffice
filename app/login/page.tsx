import { LoginPage } from "@/components/login-page"
import {auth} from "@/auth"
import { redirect } from "next/navigation"

export default async function Login() {
  const session = await auth()
  if (session) {
    redirect("/dashboard")
  }

  return <LoginPage />
}
