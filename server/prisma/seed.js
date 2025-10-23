import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env')
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
    },
  })

  console.log('✅ Admin user seeded:', admin.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
