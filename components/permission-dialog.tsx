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
import { Textarea } from "@/components/ui/textarea";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "@/lib/validations/permission";
import { ZodError } from "zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
}

interface PermissionDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  permission?: Permission | null;
}

interface FieldError {
  message: string;
}

interface FormErrors {
  name?: FieldError;
  description?: FieldError;
  module?: FieldError;
  action?: FieldError;
}

export function PermissionDialog({
  open,
  onClose,
  permission,
}: PermissionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    module: "",
    action: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description || "",
        module: permission.module,
        action: permission.action,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        module: "",
        action: "",
      });
    }
    setErrors({});
    setServerError("");
  }, [permission, open]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    try {
      const schema = permission
        ? updatePermissionSchema
        : createPermissionSchema;
      const validatedData = schema.parse(formData);

      const url = permission
        ? `/api/permissions/${permission.id}`
        : "/api/permissions";
      const method = permission ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          permission
            ? "Permission berhasil diperbarui"
            : "Permission berhasil ditambahkan"
        );
        onClose(true);
      } else {
        if (data.details) {
          const newErrors: FormErrors = {};
          data.details.forEach((detail: any) => {
            newErrors[detail.field as keyof FormErrors] = {
              message: detail.message,
            };
          });
          setErrors(newErrors);
        } else {
          setServerError(data.error || "Gagal menyimpan permission");
          toast.error(data.error || "Gagal menyimpan permission");
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
        console.error("Error saving permission:", error);
        setServerError("Gagal menyimpan permission");
        toast.error("Gagal menyimpan permission");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {permission ? "Edit Permission" : "Tambah Permission Baru"}
          </DialogTitle>
          <DialogDescription>
            {permission
              ? "Perbarui informasi permission"
              : "Buat permission baru untuk sistem"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Permission *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Buat User"
                required
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="module">Modul *</Label>
              <Input
                id="module"
                value={formData.module}
                onChange={(e) => handleChange("module", e.target.value)}
                placeholder="e.g., users"
                required
              />
              {errors.module && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.module.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Aksi *</Label>
              <Input
                id="action"
                value={formData.action}
                onChange={(e) => handleChange("action", e.target.value)}
                placeholder="e.g., create"
                required
              />
              {errors.action && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.action.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Deskripsi permission..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description.message}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : permission ? "Perbarui" : "Buat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
