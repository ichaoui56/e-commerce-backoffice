import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { verifyPassword } from "./lib/password"
import { getUserFromDb } from "./lib/auth-db"
import { CredentialsSignin } from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const email = credentials?.email as string
          const password = credentials?.password as string

          if (!email || !password) {
            throw new CredentialsSignin("Email and password are required")
          }

          // Get user from database
          const user = await getUserFromDb(email)
          if (!user) {
            throw new CredentialsSignin("Invalid credentials")
          }

          // Verify password
          const isValidPassword = verifyPassword(password, user.password_hash)
          if (!isValidPassword) {
            throw new CredentialsSignin("Invalid credentials")
          }

          // Return user object (without password)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          }
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error
          }
          throw new CredentialsSignin("Invalid credentials")
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
  },
})
