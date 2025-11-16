import { ZodError } from "zod";

/**
 * Format Zod validation errors into a readable format
 * @param error - ZodError instance
 * @returns Array of formatted error objects
 */
export function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
