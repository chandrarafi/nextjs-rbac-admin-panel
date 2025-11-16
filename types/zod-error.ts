// Type for Zod error issues
export interface ZodIssue {
  path: (string | number)[];
  message: string;
}
