import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking user role permissions...\n");

  const userRole = await prisma.role.findUnique({
    where: { name: "user" },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (userRole) {
    console.log(`Role: ${userRole.name}`);
    console.log(`Permissions (${userRole.permissions.length}):`);
    userRole.permissions.forEach((rp) => {
      console.log(
        `  - ${rp.permission.name} (${rp.permission.module}.${rp.permission.action})`
      );
    });
  } else {
    console.log("User role not found!");
  }

  console.log("\n\nChecking menus...\n");

  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  console.log(`Total active menus: ${menus.length}`);
  menus.forEach((menu) => {
    console.log(`  - ${menu.title} (roles: ${menu.roles})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
