import { z } from "zod";

export const createMenuSchema = z.object({
  title: z
    .string()
    .min(1, "Judul wajib diisi")
    .min(2, "Judul minimal 2 karakter")
    .max(50, "Judul maksimal 50 karakter")
    .trim(),
  url: z
    .string()
    .trim()
    .regex(/^\//, "URL harus diawali dengan /")
    .max(200, "URL maksimal 200 karakter")
    .optional()
    .or(z.literal(""))
    .or(z.literal("#")),
  icon: z
    .string()
    .trim()
    .min(2, "Nama icon minimal 2 karakter")
    .max(50, "Nama icon maksimal 50 karakter")
    .regex(
      /^[A-Z][a-zA-Z0-9]*$/,
      "Icon harus nama Lucide yang valid (PascalCase)"
    )
    .optional()
    .or(z.literal("")),
  order: z
    .number()
    .int("Urutan harus berupa angka bulat")
    .min(0, "Urutan minimal 0")
    .max(999, "Urutan maksimal 999")
    .default(0),
  parentId: z
    .string()
    .cuid("Format ID parent tidak valid")
    .optional()
    .or(z.literal(""))
    .nullable(),
  roles: z
    .string()
    .trim()
    .min(1, "Role wajib diisi")
    .regex(
      /^[a-z]+(,[a-z]+)*$/,
      "Role harus dipisahkan koma dengan huruf kecil (contoh: 'user,admin')"
    )
    .default("user,admin"),
  isActive: z.boolean().default(true),
});

export const updateMenuSchema = z.object({
  title: z
    .string()
    .min(2, "Judul minimal 2 karakter")
    .max(50, "Judul maksimal 50 karakter")
    .trim()
    .optional(),
  url: z
    .string()
    .trim()
    .regex(/^\//, "URL harus diawali dengan /")
    .max(200, "URL maksimal 200 karakter")
    .optional()
    .or(z.literal(""))
    .or(z.literal("#"))
    .nullable(),
  icon: z
    .string()
    .trim()
    .min(2, "Nama icon minimal 2 karakter")
    .max(50, "Nama icon maksimal 50 karakter")
    .regex(
      /^[A-Z][a-zA-Z0-9]*$/,
      "Icon harus nama Lucide yang valid (PascalCase)"
    )
    .optional()
    .or(z.literal(""))
    .nullable(),
  order: z
    .number()
    .int("Urutan harus berupa angka bulat")
    .min(0, "Urutan minimal 0")
    .max(999, "Urutan maksimal 999")
    .optional(),
  parentId: z
    .string()
    .cuid("Format ID parent tidak valid")
    .optional()
    .or(z.literal(""))
    .nullable(),
  roles: z
    .string()
    .trim()
    .regex(
      /^[a-z]+(,[a-z]+)*$/,
      "Role harus dipisahkan koma dengan huruf kecil (contoh: 'user,admin')"
    )
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
