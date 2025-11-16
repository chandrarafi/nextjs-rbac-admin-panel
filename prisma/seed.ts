import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create Permissions
  const permissions = [
    { name: "Lihat User", module: "users", action: "read" },
    { name: "Buat User", module: "users", action: "create" },
    { name: "Edit User", module: "users", action: "update" },
    { name: "Hapus User", module: "users", action: "delete" },
    { name: "Lihat Role", module: "roles", action: "read" },
    { name: "Buat Role", module: "roles", action: "create" },
    { name: "Edit Role", module: "roles", action: "update" },
    { name: "Hapus Role", module: "roles", action: "delete" },
    { name: "Lihat Permission", module: "permissions", action: "read" },
    { name: "Buat Permission", module: "permissions", action: "create" },
    { name: "Edit Permission", module: "permissions", action: "update" },
    { name: "Hapus Permission", module: "permissions", action: "delete" },
    { name: "Lihat Menu", module: "menus", action: "read" },
    { name: "Buat Menu", module: "menus", action: "create" },
    { name: "Edit Menu", module: "menus", action: "update" },
    { name: "Hapus Menu", module: "menus", action: "delete" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log("Permissions created");

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator dengan akses penuh",
      isActive: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "User biasa dengan akses terbatas",
      isActive: true,
    },
  });

  console.log("Roles created");

  // Assign all permissions to admin role
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("Admin permissions assigned");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Admin user created:", admin.email);

  // Create simplified menu structure (only Users, Roles, Permissions, Menus)
  // Level 1: User Management
  const userManagement = await prisma.menu.upsert({
    where: { id: "menu-users" },
    update: {
      url: "/dashboard/users",
    },
    create: {
      id: "menu-users",
      title: "User Management",
      url: "/dashboard/users",
      icon: "Users",
      order: 1,
      roles: "admin",
    },
  });

  // Level 1: Role Management
  const roleManagement = await prisma.menu.upsert({
    where: { id: "menu-roles" },
    update: {},
    create: {
      id: "menu-roles",
      title: "Role Management",
      url: "/dashboard/roles",
      icon: "Shield",
      order: 2,
      roles: "admin",
    },
  });

  // Level 1: Permission Management
  const permissionManagement = await prisma.menu.upsert({
    where: { id: "menu-permissions" },
    update: {},
    create: {
      id: "menu-permissions",
      title: "Permission Management",
      url: "/dashboard/permissions",
      icon: "Key",
      order: 3,
      roles: "admin",
    },
  });

  // Level 1: Menu Management
  const menuManagement = await prisma.menu.upsert({
    where: { id: "menu-menus" },
    update: {},
    create: {
      id: "menu-menus",
      title: "Menu Management",
      url: "/dashboard/menus",
      icon: "Menu",
      order: 4,
      roles: "admin",
    },
  });

  console.log("Menu structure created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
