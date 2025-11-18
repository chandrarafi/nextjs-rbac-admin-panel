"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Role = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  permissions: any[];
  _count?: {
    users: number;
  };
};

export const createColumns = (
  onEdit: (role: Role) => void,
  onDelete: (role: Role) => void
): ColumnDef<Role>[] => [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-sm sm:text-base min-w-[100px]">
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => <div className="hide-mobile">Deskripsi</div>,
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div className="text-muted-foreground text-sm max-w-[200px] truncate hide-mobile">
          {description || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.original.permissions || [];
      return (
        <div className="text-center text-sm min-w-[80px]">
          {permissions.length}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div className="min-w-[80px]">
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="text-xs px-2 py-0.5"
          >
            {isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "_count",
    header: () => <div className="hide-mobile">Pengguna</div>,
    cell: ({ row }) => {
      const count = row.original._count?.users || 0;
      return (
        <div className="text-center text-sm hide-mobile min-w-[80px]">
          {count} user
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const role = row.original;

      return (
        <div className="flex justify-end min-w-[60px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-sm">Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(role.id)}
                className="text-sm py-2.5"
              >
                Salin ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(role)}
                className="text-sm py-2.5"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(role)}
                className="text-destructive text-sm py-2.5"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
