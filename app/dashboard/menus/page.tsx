"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MenuDialog } from "@/components/menu-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { createColumns, Menu } from "./columns";
import { toast } from "sonner";

export default function MenusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchMenus();
    }
  }, [status, session]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/menu");
      if (response.ok) {
        const data = await response.json();
        setMenus(flattenMenus(data));
      } else {
        toast.error("Gagal memuat data menu");
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Flatten nested menu structure for table display
  const flattenMenus = (menuList: Menu[]): Menu[] => {
    // Sort by order first
    const sorted = [...menuList].sort((a, b) => a.order - b.order);

    // Build hierarchy
    const menuMap = new Map<string, Menu>();
    sorted.forEach((menu) => menuMap.set(menu.id, { ...menu, children: [] }));

    const rootMenus: Menu[] = [];
    sorted.forEach((menu) => {
      const menuWithChildren = menuMap.get(menu.id)!;
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(menuWithChildren);
        }
      } else {
        rootMenus.push(menuWithChildren);
      }
    });

    // Flatten for display
    const result: Menu[] = [];
    const flatten = (items: Menu[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(rootMenus);
    return result;
  };

  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setDialogOpen(true);
  };

  const handleDelete = (menu: Menu) => {
    setSelectedMenu(menu);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMenu) return;

    try {
      const response = await fetch(`/api/admin/menu/${selectedMenu.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Menu berhasil dihapus");
        // Trigger menu update event for sidebar
        window.dispatchEvent(new Event("menuUpdated"));
        fetchMenus();
        setDeleteDialogOpen(false);
        setSelectedMenu(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus menu");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Terjadi kesalahan saat menghapus menu");
    }
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setSelectedMenu(null);
    if (refresh) {
      fetchMenus();
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  const columns = createColumns(handleEdit, handleDelete);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Menu</h2>
          <p className="text-muted-foreground">
            Kelola menu navigasi sistem (3 level)
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Menu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Menu</CardTitle>
          <CardDescription>
            Daftar semua menu yang tersedia di sistem (hierarki 3 level)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={menus}
              searchKey="title"
              searchPlaceholder="Cari menu..."
            />
          )}
        </CardContent>
      </Card>

      <MenuDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        menu={selectedMenu}
        menus={menus}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedMenu(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Menu"
        description={`Apakah Anda yakin ingin menghapus menu "${selectedMenu?.title}"? Semua submenu juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
