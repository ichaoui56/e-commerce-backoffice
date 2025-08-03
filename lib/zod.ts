import { object, string } from "zod"

export const signInSchema = object({
  email: string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),
  password: string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
})

export const signUpSchema = object({
  email: string({ required_error: "Email is required" })
    .email("Please enter a valid email address"),
  password: string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be less than 32 characters"),
  name: string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
})

export const signInDefaultValues = {
  email: "",
  password: "",
}

export const signUpDefaultValues = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
}
