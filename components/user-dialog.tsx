"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { ZodError } from "zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string | null;
  roleId: string | null;
  role: {
    id: string;
    name: string;
  } | null;
}

interface UserDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  user?: User | null;
}

interface FieldError {
  message: string;
}

interface FormErrors {
  email?: FieldError;
  name?: FieldError;
  password?: FieldError;
  role?: FieldError;
}

export function UserDialog({ open, onClose, user }: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "user",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name || "",
        password: "",
        role: user.role?.name || "user",
      });
    } else {
      setFormData({
        email: "",
        name: "",
        password: "",
        role: "user",
      });
    }
    setErrors({});
    setTouched({});
    setServerError("");
  }, [user, open]);

  // Realtime validation
  const validateField = (name: string, value: any) => {
    try {
      const schema = user ? updateUserSchema : createUserSchema;

      // For update, skip password validation if empty
      if (user && name === "password" && !value) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.password;
          return newErrors;
        });
        return;
      }

      // Validate single field
      schema.pick({ [name]: true } as any).parse({ [name]: value });

      // Clear error if valid
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.issues[0];
        setErrors((prev) => ({
          ...prev,
          [name]: { message: fieldError.message },
        }));
      }
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark as touched on first change
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }

    // Validate immediately while typing (realtime)
    validateField(name, value);
  };

  const handleBlur = (name: string) => {
    // Ensure field is marked as touched
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Validate on blur as well
    validateField(name, formData[name as keyof typeof formData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    // Mark all fields as touched
    setTouched({
      email: true,
      name: true,
      password: true,
      role: true,
    });

    try {
      // Validate all fields
      const schema = user ? updateUserSchema : createUserSchema;
      const validatedData = schema.parse(formData);

      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PUT" : "POST";

      const body: any = {
        email: validatedData.email,
        name: validatedData.name || null,
        role: validatedData.role,
      };

      // Only include password if it's provided
      if (validatedData.password && validatedData.password.length > 0) {
        body.password = validatedData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          user
            ? "Pengguna berhasil diperbarui"
            : "Pengguna berhasil ditambahkan"
        );
        onClose(true);
      } else {
        if (data.details) {
          // Handle validation errors from server
          const newErrors: FormErrors = {};
          data.details.forEach((detail: any) => {
            newErrors[detail.field as keyof FormErrors] = {
              message: detail.message,
            };
          });
          setErrors(newErrors);
        } else {
          setServerError(data.error || "Failed to save user");
          toast.error(data.error || "Gagal menyimpan pengguna");
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err: any) => {
          const field = err.path[0] as keyof FormErrors;
          newErrors[field] = { message: err.message };
        });
        setErrors(newErrors);
      } else {
        console.error("Error saving user:", error);
        setServerError("Failed to save user");
        toast.error("Gagal menyimpan pengguna");
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldStatus = (field: keyof FormErrors) => {
    if (!touched[field]) return null;
    if (errors[field]) return "error";
    if (formData[field]) return "success";
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Edit Pengguna" : "Tambah Pengguna Baru"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Perbarui informasi dan role pengguna"
              : "Buat akun pengguna baru"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Email *
                {getFieldStatus("email") === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {getFieldStatus("email") === "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={
                  errors.email
                    ? "border-destructive focus-visible:ring-destructive"
                    : getFieldStatus("email") === "success"
                    ? "border-green-500 focus-visible:ring-green-500"
                    : ""
                }
                required
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                Nama
                {getFieldStatus("name") === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {getFieldStatus("name") === "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={
                  errors.name
                    ? "border-destructive focus-visible:ring-destructive"
                    : getFieldStatus("name") === "success"
                    ? "border-green-500 focus-visible:ring-green-500"
                    : ""
                }
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                Password {user ? "(kosongkan jika tidak ingin mengubah)" : "*"}
                {getFieldStatus("password") === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {getFieldStatus("password") === "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                className={
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : getFieldStatus("password") === "success"
                    ? "border-green-500 focus-visible:ring-green-500"
                    : ""
                }
                required={!user}
              />
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
              {!errors.password && !user && (
                <p className="text-xs text-muted-foreground">
                  Harus mengandung huruf besar, huruf kecil, dan angka. Minimal
                  6 karakter.
                </p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Pengguna</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.role.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {serverError}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? "Menyimpan..." : user ? "Perbarui" : "Buat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
