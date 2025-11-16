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
import { IconDialog } from "@/components/icon-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table";
import { createColumns, Icon } from "./columns";
import { toast } from "sonner";

export default function IconsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchIcons();
    }
  }, [status]);

  const fetchIcons = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/icons");
      if (response.ok) {
        const data = await response.json();
        setIcons(data);
      } else {
        toast.error("Gagal memuat data icon");
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (icon: Icon) => {
    setSelectedIcon(icon);
    setDialogOpen(true);
  };

  const handleDelete = (icon: Icon) => {
    setSelectedIcon(icon);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedIcon) return;

    try {
      const response = await fetch(`/api/icons/${selectedIcon.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Icon berhasil dihapus");
        fetchIcons();
        setDeleteDialogOpen(false);
        setSelectedIcon(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus icon");
      }
    } catch (error) {
      console.error("Error deleting icon:", error);
      toast.error("Terjadi kesalahan saat menghapus icon");
    }
  };

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false);
    setSelectedIcon(null);
    if (refresh) {
      fetchIcons();
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const columns = createColumns(handleEdit, handleDelete);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Icon</h2>
          <p className="text-muted-foreground">
            Kelola icon Lucide untuk menu sistem
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Icon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Icon</CardTitle>
          <CardDescription>
            Daftar icon Lucide yang tersedia untuk menu
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
              data={icons}
              searchKey="name"
              searchPlaceholder="Cari icon..."
            />
          )}
        </CardContent>
      </Card>

      <IconDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        icon={selectedIcon}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedIcon(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Icon"
        description={`Apakah Anda yakin ingin menghapus icon "${selectedIcon?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
