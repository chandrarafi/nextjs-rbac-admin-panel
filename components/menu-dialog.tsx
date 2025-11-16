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
import { createMenuSchema, updateMenuSchema } from "@/lib/validations/menu";
import { ZodError } from "zod";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Menu {
  id: string;
  title: string;
  url: string | null;
  icon: string | null;
  order: number;
  parentId: string | null;
  roles: string;
  isActive: boolean;
  children?: Menu[];
}

interface MenuDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  menu?: Menu | null;
  menus: Menu[];
}

interface FieldError {
  message: string;
}

interface FormErrors {
  title?: FieldError;
  url?: FieldError;
  icon?: FieldError;
  order?: FieldError;
  roles?: FieldError;
}

export function MenuDialog({ open, onClose, menu, menus }: MenuDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    icon: "",
    order: 0,
    parentId: "",
    roles: "user,admin",
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (menu) {
      setFormData({
        title: menu.title,
        url: menu.url || "",
        icon: menu.icon || "",
        order: menu.order,
        parentId: menu.parentId || "",
        roles: menu.roles,
        isActive: menu.isActive,
      });
    } else {
      setFormData({
        title: "",
        url: "",
        icon: "",
        order: 0,
        parentId: "",
        roles: "user,admin",
        isActive: true,
      });
    }
    setErrors({});
    setServerError("");
  }, [menu, open]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    try {
      const schema = menu ? updateMenuSchema : createMenuSchema;
      const dataToValidate = {
        ...formData,
        parentId: formData.parentId || null,
        url: formData.url || null,
        icon: formData.icon || null,
      };
      const validatedData = schema.parse(dataToValidate);

      const url = menu ? `/api/admin/menu/${menu.id}` : "/api/admin/menu";
      const method = menu ? "PUT" : "POST";

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
          menu ? "Menu berhasil diperbarui" : "Menu berhasil ditambahkan"
        );
        // Trigger menu update event for sidebar
        window.dispatchEvent(new Event("menuUpdated"));
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
          setServerError(data.error || "Gagal menyimpan menu");
          toast.error(data.error || "Gagal menyimpan menu");
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
        console.error("Error saving menu:", error);
        setServerError("Gagal menyimpan menu");
        toast.error("Gagal menyimpan menu");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter parent menus (max 2 levels)
  const getAvailableParents = () => {
    // Remove duplicates by using a Map with id as key
    const uniqueMenus = new Map<string, Menu>();
    menus.forEach((m) => uniqueMenus.set(m.id, m));
    const uniqueMenuList = Array.from(uniqueMenus.values());

    if (menu) {
      // When editing, exclude self and children
      return uniqueMenuList.filter(
        (m) =>
          m.id !== menu.id &&
          !m.parentId && // Only level 1 menus can be parents
          !menu.children?.some((child) => child.id === m.id)
      );
    }
    // For new menu, show all level 1 and level 2 menus
    return uniqueMenuList.filter((m) => {
      if (!m.parentId) return true; // Level 1
      const parent = uniqueMenuList.find((p) => p.id === m.parentId);
      return parent && !parent.parentId; // Level 2 (parent is level 1)
    });
  };

  const availableParents = getAvailableParents();

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{menu ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
          <DialogDescription>
            {menu ? "Perbarui informasi menu" : "Buat menu baru untuk sistem"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Dashboard"
                required
              />
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Menu</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) =>
                  handleChange("parentId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih parent (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada (Level 1)</SelectItem>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.parentId ? "  → " : ""}
                      {parent.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url || ""}
                onChange={(e) => handleChange("url", e.target.value)}
                placeholder="e.g., /dashboard atau #"
              />
              {errors.url && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.url.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Lucide)</Label>
              <Input
                id="icon"
                value={formData.icon || ""}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="e.g., LayoutDashboard"
              />
              {errors.icon && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.icon.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Urutan *</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  handleChange("order", parseInt(e.target.value) || 0)
                }
                required
              />
              {errors.order && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.order.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roles">Roles *</Label>
              <Input
                id="roles"
                value={formData.roles}
                onChange={(e) => handleChange("roles", e.target.value)}
                placeholder="e.g., user,admin"
                required
              />
              {errors.roles && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.roles.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Pisahkan dengan koma untuk multiple roles
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="isActive">Menu Aktif</Label>
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
              {loading ? "Menyimpan..." : menu ? "Perbarui" : "Buat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
