import { z } from "zod";

export const createIconSchema = z.object({
  name: z
    .string()
    .min(2, "Nama icon minimal 2 karakter")
    .max(50, "Nama icon maksimal 50 karakter"),
  category: z
    .string()
    .min(2, "Kategori minimal 2 karakter")
    .max(30, "Kategori maksimal 30 karakter")
    .default("general"),
  isActive: z.boolean().default(true),
});

export const updateIconSchema = z.object({
  name: z
    .string()
    .min(2, "Nama icon minimal 2 karakter")
    .max(50, "Nama icon maksimal 50 karakter")
    .optional(),
  category: z
    .string()
    .min(2, "Kategori minimal 2 karakter")
    .max(30, "Kategori maksimal 30 karakter")
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateIconInput = z.infer<typeof createIconSchema>;
export type UpdateIconInput = z.infer<typeof updateIconSchema>;
