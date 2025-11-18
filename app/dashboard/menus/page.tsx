"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAdminMenu } from "@/lib/hooks/use-admin-menu";
import { usePageVisibility } from "@/lib/hooks/use-page-visibility";
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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // Detect if page is visible for conditional polling
  const isPageVisible = usePageVisibility();

  // Auto-refresh every 15 seconds when page is visible
  const {
    menus: rawMenus,
    pagination,
    isLoading,
    mutate,
  } = useAdminMenu({
    page,
    limit: 50,
    search,
    refreshInterval: isPageVisible ? 15000 : 0, // 15s when visible
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    // Permission check removed - API will handle authorization
    // This allows users with proper permissions to access the page
  }, [status, router]);

  // Flatten nested menu structure for table display
  const flattenMenus = React.useCallback((menuList: Menu[]): Menu[] => {
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
  }, []);

  const menus = React.useMemo(
    () => flattenMenus(rawMenus),
    [rawMenus, flattenMenus]
  );

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
        mutate();
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
      mutate();
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

  const columns = createColumns(handleEdit, handleDelete);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Manajemen Menu
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Kelola menu navigasi sistem (3 level)
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full sm:w-auto touch-target"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hide-mobile">Tambah Menu</span>
          <span className="show-mobile">Tambah</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Semua Menu</CardTitle>
          <CardDescription className="text-sm">
            Daftar semua menu yang tersedia di sistem (hierarki 3 level)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
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
