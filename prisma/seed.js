import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@shahinestore.com'
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })

  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password_hash: hashedPassword,
      },
    })
    console.log('✅ Admin user created')
  } else {
    console.log('⚠️ Admin user already exists')
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
