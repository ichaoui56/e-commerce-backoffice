"use client"

import type React from "react"

import { useState } from "react"
import { useFormState } from "react-dom" // Import from react-dom instead
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Store } from "lucide-react"
import { signInAction } from "@/lib/actions/auth-actions"
import { FormFieldApp } from "@/components/ui/form-field-app"
import SubmitButton from "@/components/ui/submit-button"
import { FormError } from "@/components/ui/form-error"
import { signInDefaultValues } from "@/lib/zod"

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useFormState(signInAction, null) // Use useFormState instead

  const formValues = {
    email: state?.values?.email || signInDefaultValues.email,
    password: state?.values?.password || signInDefaultValues.password,
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#e94491] to-[#f472b6] rounded-2xl flex items-center justify-center shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access the Shahine Store admin dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.errors && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                 {Object.entries(state.errors).map(([field, messages]) => 
                   messages.map((message, index) => 
                     `${field}: ${message}${index < messages.length - 1 ? '\n' : ''}`
                   ).join('')
                 ).join('\n')}
               </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <FormFieldApp
                defaultValues={formValues}
                name="email"
                label="Email Address"
                type="email"
                placeholder="admin@shahinestore.com"
                required
                className="h-11 border-gray-200 focus:border-[#e94491] focus:ring-[#e94491]"
              />
              <FormError errors={state?.errors?.email} />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <FormFieldApp
                  defaultValues={formValues}
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="h-11 pr-10 border-gray-200 focus:border-[#e94491] focus:ring-[#e94491]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-[23px] h-11 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <FormError errors={state?.errors?.password} />
            </div>

            <SubmitButton
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-[#e94491] to-[#f472b6] hover:from-[#d63384] hover:to-[#ec4899] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Sign In
            </SubmitButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Demo credentials: admin@shahinestore.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}