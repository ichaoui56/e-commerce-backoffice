"use server"

import { redirect } from "next/navigation"
import { signUpSchema, signInSchema } from "@/lib/zod"
import { saltAndHashPassword } from "@/lib/password"
import { createUser, getUserFromDb } from "@/lib/auth-db"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { ratelimit } from "@/lib/ratelimit"
import { headers } from "next/headers"

export type FormState = {
  errors?: {
    email?: string[]
    password?: string[]
    name?: string[]
  }
  message?: string
  values?: {
    email?: string
    password?: string
    name?: string
  }
}

export async function signUpAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const submittedValues = { name, email, password }

  try {
    // Rate limiting
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1"
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return {
        message: "Too many attempts. Please try again later.",
        values: submittedValues,
      }
    }

    // Validate input with Zod
    const validatedFields = signUpSchema.safeParse({
      email: email?.toLowerCase().trim(),
      password,
      name: name?.trim()
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        values: submittedValues,
      }
    }

    // Check if user already exists
    const existingUser = await getUserFromDb(validatedFields.data.email)
    if (existingUser) {
      return {
        errors: {
          email: ["An account with this email already exists"],
        },
        values: submittedValues,
      }
    }

    // Hash password
    const hashedPassword = saltAndHashPassword(validatedFields.data.password)

    // Create user
    const user = await createUser(
      validatedFields.data.email,
      hashedPassword,
      validatedFields.data.name
    )

    if (!user) {
      return {
        message: "Failed to create account. Please try again.",
        values: submittedValues,
      }
    }

    redirect("/auth/sign-in?message=Account created successfully")
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }
    return {
      message: "Something went wrong. Please try again.",
      values: submittedValues,
    }
  }
}

export async function signInAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const submittedValues = { email, password }

  try {
    // Rate limiting
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1"
    const { success } = await ratelimit.limit(ip)
    
    if (!success) {
      return {
        message: "Too many login attempts. Please try again later.",
        values: submittedValues,
      }
    }

    // Validate input with Zod
    const validatedFields = signInSchema.safeParse({
      email: email?.toLowerCase().trim(),
      password,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        values: submittedValues,
      }
    }

    await signIn("credentials", formData)
    redirect("/")
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error
    }
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Invalid email or password. Please check your credentials and try again.",
            values: submittedValues,
          }
        default:
          return {
            message: "Authentication failed. Please try again.",
            values: submittedValues,
          }
      }
    }
    
    return {
      message: "Something went wrong. Please try again.",
      values: submittedValues,
    }
  }
}

export async function signOutAction() {
  await signOut()
}
