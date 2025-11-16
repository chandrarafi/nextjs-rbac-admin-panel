import { prisma } from "@/lib/prisma";

/**
 * Check if user has specific permission
 * @param userRole - User's role name
 * @param module - Permission module (e.g., "users", "roles")
 * @param action - Permission action (e.g., "create", "read", "update", "delete")
 * @returns boolean - true if user has permission
 */
export async function checkPermission(
  userRole: string,
  module: string,
  action: string
): Promise<boolean> {
  // Check if role has specific permission
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

  if (!role) {
    return false;
  }

  const hasPermission = role.permissions.some(
    (rp) => rp.permission.module === module && rp.permission.action === action
  );

  return hasPermission;
}

/**
 * Check if user has any of the specified permissions
 * @param userRole - User's role name
 * @param permissions - Array of [module, action] tuples
 * @returns boolean - true if user has any of the permissions
 */
export async function checkAnyPermission(
  userRole: string,
  permissions: Array<[string, string]>
): Promise<boolean> {
  for (const [module, action] of permissions) {
    const hasPermission = await checkPermission(userRole, module, action);
    if (hasPermission) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has all of the specified permissions
 * @param userRole - User's role name
 * @param permissions - Array of [module, action] tuples
 * @returns boolean - true if user has all permissions
 */
export async function checkAllPermissions(
  userRole: string,
  permissions: Array<[string, string]>
): Promise<boolean> {
  for (const [module, action] of permissions) {
    const hasPermission = await checkPermission(userRole, module, action);
    if (!hasPermission) {
      return false;
    }
  }

  return true;
}
