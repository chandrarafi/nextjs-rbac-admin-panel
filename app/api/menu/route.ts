import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface MenuData {
  id: string;
  title: string;
  url: string | null;
  icon: string | null;
  order: number;
  parentId: string | null;
  roles: string;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role || "user";

    // Get user's role with permissions
    const role = await prisma.role.findUnique({
      where: { name: userRole },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Get user permissions
    const userPermissions =
      role?.permissions.map((rp: any) => rp.permission.module) || [];
    const hasMenuPermission = (menuTitle: string) => {
      // Admin has access to all menus
      if (userRole === "admin") return true;

      // Map menu titles to permission modules
      const menuPermissionMap: Record<string, string> = {
        "User Management": "users",
        "Role Management": "roles",
        "Permission Management": "permissions",
        "Menu Management": "menus",
      };

      const requiredModule = menuPermissionMap[menuTitle];
      if (!requiredModule) return true; // Allow access if no specific permission required

      return userPermissions.includes(requiredModule);
    };

    // Get all active menus
    const menus = await prisma.menu.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    // Filter menus by role and permissions
    const filteredMenus = menus.filter((menu: MenuData) => {
      const allowedRoles = menu.roles.split(",").map((r: string) => r.trim());
      const hasRoleAccess = allowedRoles.includes(userRole);
      const hasPermissionAccess = hasMenuPermission(menu.title);

      return hasRoleAccess && hasPermissionAccess;
    });

    // Build 3-level hierarchy
    const buildHierarchy = (
      parentId: string | null = null,
      level: number = 1
    ): any[] => {
      if (level > 3) return []; // Max 3 levels

      return filteredMenus
        .filter((menu: MenuData) => menu.parentId === parentId)
        .map((menu: MenuData) => ({
          id: menu.id,
          title: menu.title,
          url: menu.url,
          icon: menu.icon,
          order: menu.order,
          items: buildHierarchy(menu.id, level + 1),
        }));
    };

    const menuHierarchy = buildHierarchy();

    return NextResponse.json(menuHierarchy);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
