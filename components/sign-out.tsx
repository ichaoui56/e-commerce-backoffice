import { signOutAction } from "@/lib/actions/auth-actions"
import { LogOut } from 'lucide-react'

export function SignOut() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </button>
    </form>
  )
}
