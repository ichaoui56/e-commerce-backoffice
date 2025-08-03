"use client"

import type * as React from "react"
import { useFormStatus } from "react-dom"
import { Button } from "./button"
import { Loader2 } from "lucide-react"

export default function SubmitButton(props: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending} type="submit" {...props}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : props.children}
    </Button>
  )
}
