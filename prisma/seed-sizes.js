import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

async function main() {
  for (const label of sizes) {
    const exists = await prisma.size.findUnique({ where: { label } })
    if (!exists) {
      await prisma.size.create({
        data: { label },
      })
      console.log(`✅ Created size: ${label}`)
    } else {
      console.log(`⚠️ Size already exists: ${label}`)
    }
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
