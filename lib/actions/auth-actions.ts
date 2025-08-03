"use server"

import { redirect } from "next/navigation"
import { signUpSchema, signInSchema } from "@/lib/zod"
import { saltAndHashPassword } from "@/lib/password"
import { createUser, getUserFromDb } from "@/lib/auth-db"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export type FormState = {
  errors?: {
    email?: string[]
    password?: string[]
    name?: string[]
  }
  message?: string
  // Add values to persist form data
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

  // Store submitted values to return them if validation fails
  const submittedValues = {
    name,
    email,
    password,
  }

  try {
    // Validate input with Zod
    const validatedFields = signUpSchema.safeParse({
      email,
      password,
      name
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        values: submittedValues, // Return submitted values
      }
    }

    // Check if user already exists
    const existingUser = await getUserFromDb(validatedFields.data.email)
    if (existingUser) {
      return {
        errors: {
          email: ["An account with this email already exists"],
        },
        values: submittedValues, // Return submitted values
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
        values: submittedValues, // Return submitted values
      }
    }

    // Redirect to signin page
    redirect("/auth/sign-in?message=Account created successfully")
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error // Re-throw redirect errors
    }
    return {
      message: "Something went wrong. Please try again.",
      values: submittedValues, // Return submitted values
    }
  }
}

export async function signInAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Store submitted values to return them if validation fails
  const submittedValues = {
    email,
    password,
  }

  try {
    // Validate input with Zod
    const validatedFields = signInSchema.safeParse({
      email,
      password,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        values: submittedValues, // Return submitted values
      }
    }

    await signIn("credentials", formData)

    // If we get here, sign in was successful
    redirect("/") // or wherever you want to redirect after sign in
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error // Re-throw redirect errors
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Invalid email or password.",
            values: submittedValues, // Return submitted values
          }
        default:
          return {
            message: "Something went wrong. Please try again.",
            values: submittedValues, // Return submitted values
          }
      }
    }

    return {
      message: "Something went wrong. Please try again.",
      values: submittedValues, // Return submitted values
    }
  }
}

export async function signOutAction() {
  await signOut()
}