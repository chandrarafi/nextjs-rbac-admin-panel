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
import { PermissionDialog } from "@/components/permission-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { createColumns, Permission } from "./columns";
import { toast } from "sonner";

export default function PermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);

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
      fetchPermissions();
    }
  }, [status, session]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/permissions");
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      } else {
        toast.error("Gagal memuat data permission");
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

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
        fetchPermissions();
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
      fetchPermissions();
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

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return null;
  }

  const columns = createColumns(handleEdit, handleDelete);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manajemen Permission
          </h2>
          <p className="text-muted-foreground">
            Kelola permission untuk kontrol akses sistem
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Permission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Permission</CardTitle>
          <CardDescription>
            Daftar semua permission yang tersedia di sistem
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
