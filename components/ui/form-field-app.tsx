"use client"

import * as React from "react"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { cn } from "@/lib/utils"

// Update Props: Add onChange handler
interface FormFieldAppProps<TValues extends Record<string, unknown>, TName extends keyof TValues>
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
    "name" | "id" | "defaultValue" | "aria-invalid" | "aria-errormessage" | "onChange"
  > {
  defaultValues: TValues // Pass the structure defining fields/defaults
  errors?: Partial<Record<keyof TValues, string | string[]>> | null // Pass errors separately
  name: TName // Name must be a key of defaultValues
  label: string
  pending?: boolean
  type?: "text" | "email" | "textarea" | "number" | "password"
  required?: boolean
  defaultValue?: string // Keep this for potential overrides
  onChange?: (value: string) => void // Add onChange handler
}

// Update component signature and body to use new props
export function FormFieldApp<TValues extends Record<string, unknown>, TName extends keyof TValues>({
  defaultValues,
  errors,
  name,
  label,
  pending,
  type = "text",
  required = false,
  placeholder,
  className,
  defaultValue,
  onChange,
  ...props
}: FormFieldAppProps<TValues, TName>) {
  const id = React.useId()
  const errorId = `${id}-error-${name as string}`
  // Check errors using the 'errors' prop
  const hasError = !!errors?.[name]
  // Get default value from 'defaultValues' prop if 'defaultValue' prop isn't set
  // Ensure the value passed to the input is a string
  const defaultFieldValue = defaultValue ?? (defaultValues?.[name] !== undefined ? String(defaultValues[name]) : "")

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <div className={cn("group/field grid gap-2", className)} data-invalid={hasError}>
      <Label htmlFor={id} className="group-data-[invalid=true]/field:text-destructive">
        {label} {required && <span aria-hidden="true">*</span>}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          name={name as string}
          placeholder={placeholder}
          className="group-data-[invalid=true]/field:border-destructive focus-visible:group-data-[invalid=true]/field:ring-destructive"
          disabled={pending}
          aria-invalid={hasError}
          aria-errormessage={hasError ? errorId : undefined}
          defaultValue={defaultFieldValue} // Uses calculated default
          onChange={handleChange} // Add onChange handler
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <Input
          id={id}
          name={name as string}
          type={type}
          placeholder={placeholder}
          className="group-data-[invalid=true]/field:border-destructive focus-visible:group-data-[invalid=true]/field:ring-destructive"
          disabled={pending}
          aria-invalid={hasError}
          aria-errormessage={hasError ? errorId : undefined}
          defaultValue={defaultFieldValue} // Uses calculated default
          onChange={handleChange} // Add onChange handler
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {/* Show error message from 'errors' prop */}
      {hasError && errors?.[name] && (
        <p id={errorId} className="text-destructive text-sm">
          {Array.isArray(errors[name]) ? errors[name][0] : errors[name]}
        </p>
      )}
    </div>
  )
}
