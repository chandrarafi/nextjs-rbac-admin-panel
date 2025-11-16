import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test user...");

  const userRole = await prisma.role.findUnique({
    where: { name: "user" },
  });

  if (!userRole) {
    console.error("User role not found!");
    return;
  }

  const hashedPassword = await bcrypt.hash("user123", 10);

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {
      roleId: userRole.id,
    },
    create: {
      email: "user@example.com",
      name: "Test User",
      password: hashedPassword,
      roleId: userRole.id,
    },
  });

  console.log("Test user created/updated:");
  console.log(`Email: ${user.email}`);
  console.log(`Password: user123`);
  console.log(`Role: user`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
