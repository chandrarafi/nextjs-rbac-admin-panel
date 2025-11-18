"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/lib/hooks/use-permissions";
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
import { PermissionDialog } from "@/components/permission-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { createColumns, Permission } from "./columns";
import { toast } from "sonner";

export default function PermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);

  // Detect if page is visible for conditional polling
  const isPageVisible = usePageVisibility();

  // Auto-refresh every 15 seconds when page is visible
  const { permissions, pagination, isLoading, mutate } = usePermissions({
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

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setDialogOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPermission) return;

    try {
      const response = await fetch(
        `/api/permissions/${selectedPermission.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Permission berhasil dihapus");
        mutate();
        setDeleteDialogOpen(false);
        setSelectedPermission(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus permission");
      }
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("Terjadi kesalahan saat menghapus permission");
    }
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setSelectedPermission(null);
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
          <Skeleton className="h-10 w-[150px]" />
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
            Manajemen Permission
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Kelola permission untuk kontrol akses sistem
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full sm:w-auto touch-target"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hide-mobile">Tambah Permission</span>
          <span className="show-mobile">Tambah</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Semua Permission</CardTitle>
          <CardDescription className="text-sm">
            Daftar semua permission yang tersedia di sistem
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
              data={permissions}
              searchKey="name"
              searchPlaceholder="Cari permission..."
            />
          )}
        </CardContent>
      </Card>

      <PermissionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        permission={selectedPermission}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedPermission(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Permission"
        description={`Apakah Anda yakin ingin menghapus permission "${selectedPermission?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
