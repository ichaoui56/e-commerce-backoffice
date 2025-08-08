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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="sm:border border-gray-200 sm:shadow-lg sm:bg-white">
          <CardHeader className="text-center pb-8 pt-10 px-6 sm:px-8">
            {/* Logo */}
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white -2 rounded-2xl flex items-center justify-center shadow-sm mb-6" 
                 style={{ borderColor: '#e94491' }}>
              <img src="logo-shahine.png" alt="" className="w-14" />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 text-base sm:text-lg">
                Sign in to your <span className="text-[#e94491]"> Shahine Store </span> dashboard
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-8">
            <form action={formAction} className="space-y-6">
              {/* Global error message */}
              {state?.message && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 font-medium">
                    {state.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: '#e94491' }} />
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
                    placeholder="Enter your email address"
                    className={cn(
                      "h-12 pl-4 pr-12 text-base border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-1",
                      touched.email && !validation.email.isValid
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : touched.email && validation.email.isValid
                        ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                        : "border-gray-200 focus:border-pink-500 focus:ring-pink-100"
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
                  <p className="text-sm text-red-600 flex items-center gap-1">
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
                  <Lock className="w-4 h-4" style={{ color: '#e94491' }} />
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
                      "h-12 pl-4 pr-20 text-base border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-1",
                      touched.password && !validation.password.isValid
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : touched.password && validation.password.isValid
                        ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                        : "border-gray-200 focus:border-pink-500 focus:ring-pink-100"
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
                  <p className="text-sm text-red-600 flex items-center gap-1">
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
              <div className="pt-4">
                <SubmitButton
                  type="submit"
                  disabled={!isFormValid}
                  className={cn(
                    "w-full h-12 text-base font-semibold transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]",
                    isFormValid
                      ? "text-white shadow-md hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                  style={isFormValid ? {
                    backgroundColor: '#e94491',
                    borderColor: '#e94491'
                  } : undefined}
                >
                  Sign In to Dashboard
                </SubmitButton>
              </div>
            </form>

            {/* Security notice */}
            <div className="mt-8 text-center">
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" />
                  Your connection is secured with end-to-end encryption
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  )
}