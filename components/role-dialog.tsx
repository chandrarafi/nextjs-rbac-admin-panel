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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { createRoleSchema, updateRoleSchema } from "@/lib/validations/role";
import { ZodError } from "zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  permissions: {
    permission: Permission;
  }[];
}

interface RoleDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  role?: Role | null;
}

interface FieldError {
  message: string;
}

interface FormErrors {
  name?: FieldError;
  description?: FieldError;
}

export function RoleDialog({ open, onClose, role }: RoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    permissionIds: [] as string[],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (open) {
      fetchPermissions();
    }
  }, [open]);

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || "",
        isActive: role.isActive,
        permissionIds: role.permissions.map((p) => p.permission.id),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        isActive: true,
        permissionIds: [],
      });
    }
    setErrors({});
    setServerError("");
  }, [role, open]);

  const fetchPermissions = async () => {
    try {
      // Fetch all permissions for dialog (limit 200 should be enough)
      const response = await fetch("/api/permissions?page=1&limit=200");
      if (response.ok) {
        const result = await response.json();
        // Handle new pagination format { data: [], pagination: {} }
        const permissionsData = result.data || result;
        setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions([]);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    try {
      const schema = role ? updateRoleSchema : createRoleSchema;
      const validatedData = schema.parse(formData);

      const url = role ? `/api/roles/${role.id}` : "/api/roles";
      const method = role ? "PUT" : "POST";

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
          role ? "Role berhasil diperbarui" : "Role berhasil ditambahkan"
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
          setServerError(data.error || "Gagal menyimpan role");
          toast.error(data.error || "Gagal menyimpan role");
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
        console.error("Error saving role:", error);
        setServerError("Gagal menyimpan role");
        toast.error("Gagal menyimpan role");
      }
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Tambah Role Baru"}</DialogTitle>
          <DialogDescription>
            {role ? "Perbarui informasi role" : "Buat role baru untuk sistem"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Role *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Manager"
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
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Deskripsi role..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Role Aktif</Label>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto p-4 space-y-4 bg-muted/30">
                    {Object.entries(groupedPermissions).map(
                      ([module, perms]) => (
                        <div
                          key={module}
                          className="bg-background rounded-lg border p-3 space-y-3"
                        >
                          <h4 className="font-semibold capitalize text-sm text-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {module}
                          </h4>
                          <div className="grid grid-cols-2 gap-2.5 pl-3.5">
                            {perms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-start space-x-2"
                              >
                                <Checkbox
                                  id={permission.id}
                                  checked={formData.permissionIds.includes(
                                    permission.id
                                  )}
                                  onCheckedChange={() =>
                                    handlePermissionToggle(permission.id)
                                  }
                                  className="mt-0.5"
                                />
                                <label
                                  htmlFor={permission.id}
                                  className="text-sm cursor-pointer leading-tight select-none"
                                >
                                  {permission.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                    {Object.keys(groupedPermissions).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          Tidak ada permission tersedia
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : role ? "Perbarui" : "Buat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
