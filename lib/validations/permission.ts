import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(2, "Nama permission minimal 2 karakter")
    .max(100, "Nama permission maksimal 100 karakter"),
  description: z.string().optional(),
  module: z
    .string()
    .min(2, "Nama modul minimal 2 karakter")
    .max(50, "Nama modul maksimal 50 karakter"),
  action: z
    .string()
    .min(2, "Nama aksi minimal 2 karakter")
    .max(50, "Nama aksi maksimal 50 karakter"),
});

export const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(2, "Nama permission minimal 2 karakter")
    .max(100, "Nama permission maksimal 100 karakter")
    .optional(),
  description: z.string().optional(),
  module: z
    .string()
    .min(2, "Nama modul minimal 2 karakter")
    .max(50, "Nama modul maksimal 50 karakter")
    .optional(),
  action: z
    .string()
    .min(2, "Nama aksi minimal 2 karakter")
    .max(50, "Nama aksi maksimal 50 karakter")
    .optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
