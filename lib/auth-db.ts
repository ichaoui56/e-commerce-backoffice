import { prisma } from '@/lib/db' // Use your existing db.ts file

export async function getUserFromDb(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function createUser(email: string, hashedPassword: string, name: string) {
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
      }
    })
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}