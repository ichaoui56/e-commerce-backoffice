import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  errors?: string[]
}

export function FormError({ errors }: FormErrorProps) {
  if (!errors || errors.length === 0) return null

  return (
    <div className="space-y-1">
      {errors.map((error, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  )
}
