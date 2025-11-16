import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Nama role minimal 2 karakter")
    .max(50, "Nama role maksimal 50 karakter"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  permissionIds: z.array(z.string()).optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Nama role minimal 2 karakter")
    .max(50, "Nama role maksimal 50 karakter")
    .optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
