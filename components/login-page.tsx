"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useFormState } from "react-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Store, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { signInAction } from "@/lib/actions/auth-actions"
import SubmitButton from "@/components/ui/submit-button"
import { cn } from "@/lib/utils"

interface ValidationState {
  email: {
    isValid: boolean
    message: string
  }
  password: {
    isValid: boolean
    message: string
  }
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useFormState(signInAction, null)
  const [formData, setFormData] = useState({
    email: state?.values?.email || "",
    password: state?.values?.password || "",
  })
  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" }
  })
  const [touched, setTouched] = useState({
    email: false,
    password: false
  })

  // Real-time validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isEmailValid = emailRegex.test(formData.email)
    const isPasswordValid = formData.password.length >= 6

    setValidation({
      email: {
        isValid: isEmailValid,
        message: !isEmailValid && formData.email ? "Please enter a valid email address" : ""
      },
      password: {
        isValid: isPasswordValid,
        message: !isPasswordValid && formData.password ? "Password must be at least 6 characters" : ""
      }
    })
  }, [formData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const isFormValid = validation.email.isValid && validation.password.isValid

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-xl relative z-10 overflow-hidden">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg blur opacity-20"></div>
        <div className="relative bg-white rounded-lg">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Store className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-500 text-base">
                Sign in to access the Shahine Store admin dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form action={formAction} className="space-y-6">
              {/* Global error message */}
              {state?.message && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 font-medium">
                    {state.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="admin@shahinestore.com"
                    className={cn(
                      "h-12 pl-4 pr-10 text-base border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2",
                      touched.email && !validation.email.isValid
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : touched.email && validation.email.isValid
                        ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    )}
                    required
                  />
                  {touched.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {validation.email.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {touched.email && validation.email.message && (
                  <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" />
                    {validation.email.message}
                  </p>
                )}
                {state?.errors?.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter your password"
                    className={cn(
                      "h-12 pl-4 pr-20 text-base border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2",
                      touched.password && !validation.password.isValid
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : touched.password && validation.password.isValid
                        ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    )}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {touched.password && (
                      <div>
                        {validation.password.isValid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                {touched.password && validation.password.message && (
                  <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" />
                    {validation.password.message}
                  </p>
                )}
                {state?.errors?.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <SubmitButton
                type="submit"
                disabled={!isFormValid}
                className={cn(
                  "w-full h-12 text-base font-semibold shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                  isFormValid
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm"
                )}
              >
                Sign In to Dashboard
              </SubmitButton>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="text-center">
                <p className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials</p>
                <div className="space-y-1 text-sm text-blue-700">
                  <p><span className="font-medium">Email:</span> admin@shahinestore.com</p>
                  <p><span className="font-medium">Password:</span> admin123</p>
                </div>
              </div>
            </div>

            {/* Security notice */}
            <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Your connection is secured with end-to-end encryption
              </p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
