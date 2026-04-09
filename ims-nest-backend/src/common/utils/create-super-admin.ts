import { Role } from "@prisma/client";
import { PrismaClient } from "@prisma/client"
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient()

export async function createSuperAdmin() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN },
  })

  if (existingAdmin) {
    console.log('✅ Super Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('Super@123', 10);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@ims.com',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log('🔥 Super Admin created successfully');
}