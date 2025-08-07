import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { verifyPassword } from "./lib/password"
import { getUserFromDb } from "./lib/auth-db"
import { CredentialsSignin } from "next-auth"
import { signInSchema } from "./lib/zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: process.env.NODE_ENV !== "production",
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // Validate credentials with Zod
          const validatedFields = signInSchema.safeParse(credentials)
          
          if (!validatedFields.success) {
            throw new CredentialsSignin("Invalid input format")
          }

          const { email, password } = validatedFields.data

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
          throw new CredentialsSignin("Authentication failed")
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
