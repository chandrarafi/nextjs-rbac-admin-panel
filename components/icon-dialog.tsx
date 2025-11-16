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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createIconSchema, updateIconSchema } from "@/lib/validations/icon";
import { ZodError } from "zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

interface Icon {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
}

interface IconDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  icon?: Icon | null;
}

interface FieldError {
  message: string;
}

interface FormErrors {
  name?: FieldError;
  category?: FieldError;
}

const categories = [
  "general",
  "navigation",
  "action",
  "social",
  "media",
  "business",
  "development",
];

export function IconDialog({ open, onClose, icon }: IconDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "general",
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (icon) {
      setFormData({
        name: icon.name,
        category: icon.category,
        isActive: icon.isActive,
      });
    } else {
      setFormData({
        name: "",
        category: "general",
        isActive: true,
      });
    }
    setErrors({});
    setServerError("");
  }, [icon, open]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    try {
      const schema = icon ? updateIconSchema : createIconSchema;
      const validatedData = schema.parse(formData);

      const url = icon ? `/api/icons/${icon.id}` : "/api/icons";
      const method = icon ? "PUT" : "POST";

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
          icon ? "Icon berhasil diperbarui" : "Icon berhasil ditambahkan"
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
          setServerError(data.error || "Gagal menyimpan icon");
          toast.error(data.error || "Gagal menyimpan icon");
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
        console.error("Error saving icon:", error);
        setServerError("Gagal menyimpan icon");
        toast.error("Gagal menyimpan icon");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = () => {
    if (!formData.name) return null;
    const IconComponent = (LucideIcons as any)[formData.name];
    if (!IconComponent) return null;
    return <IconComponent className="h-8 w-8" />;
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{icon ? "Edit Icon" : "Tambah Icon Baru"}</DialogTitle>
          <DialogDescription>
            {icon
              ? "Perbarui informasi icon"
              : "Tambahkan icon Lucide baru ke sistem"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Icon (Lucide) *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., LayoutDashboard"
                required
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Lihat daftar icon di{" "}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  lucide.dev/icons
                </a>
              </p>
            </div>

            {formData.name && (
              <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/30">
                <div className="text-center space-y-2">
                  <div className="flex justify-center">{renderIcon()}</div>
                  <p className="text-sm text-muted-foreground">
                    Preview: {formData.name}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Icon Aktif</Label>
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
              {loading ? "Menyimpan..." : icon ? "Perbarui" : "Buat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
