"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRoles } from "@/lib/hooks/use-roles";
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
import { RoleDialog } from "@/components/role-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { createColumns, Role } from "./columns";
import { toast } from "sonner";

export default function RolesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Detect if page is visible for conditional polling
  const isPageVisible = usePageVisibility();

  // Auto-refresh every 15 seconds when page is visible
  const { roles, pagination, isLoading, mutate } = useRoles({
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

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/roles/${selectedRole.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Role berhasil dihapus");
        mutate();
        setDeleteDialogOpen(false);
        setSelectedRole(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Terjadi kesalahan saat menghapus role");
    }
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setSelectedRole(null);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Role</h2>
          <p className="text-muted-foreground">
            Kelola role dan permission untuk kontrol akses
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Role</CardTitle>
          <CardDescription>
            Daftar semua role yang tersedia di sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={roles}
              searchKey="name"
              searchPlaceholder="Cari role..."
            />
          )}
        </CardContent>
      </Card>

      <RoleDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        role={selectedRole}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedRole(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Role"
        description={`Apakah Anda yakin ingin menghapus role "${selectedRole?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
