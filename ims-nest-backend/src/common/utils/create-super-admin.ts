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

  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing SUPER ADMIN credentials in .env');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: email,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log('🔥 Super Admin created successfully');
}