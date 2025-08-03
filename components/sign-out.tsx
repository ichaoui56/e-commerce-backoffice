import { signOutAction } from "@/lib/actions/auth-actions"
import { LogOut } from "lucide-react"

export function SignOut() {
  return (
    <form
      action={signOutAction}
    >
      <button
            className="w-full justify-start gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
    </form>
  )
}