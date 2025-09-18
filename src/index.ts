import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const result = await prisma.$queryRaw`SELECT current_user, session_user, current_database();`
    console.log(result)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
