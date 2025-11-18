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

export type User = {
  id: string;
  email: string;
  name: string | null;
  roleId: string | null;
  role: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export const createColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  currentUserId?: string
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => {
      return (
        <div className="font-medium text-sm sm:text-base min-w-[120px]">
          {row.getValue("name") || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate text-sm min-w-[180px]">
          {row.getValue("email")}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      const roleName = user.role?.name || "user";
      return (
        <div className="min-w-[100px]">
          <Badge
            variant={roleName === "admin" ? "default" : "secondary"}
            className="text-xs px-2 py-0.5"
          >
            {roleName === "admin" ? "Admin" : "User"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="hide-mobile">Dibuat</div>,
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground text-xs sm:text-sm hide-mobile">
          {new Date(row.getValue("createdAt")).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Aksi</div>,
    cell: ({ row }) => {
      const user = row.original;
      const isCurrentUser = user.id === currentUserId;

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
                onClick={() => navigator.clipboard.writeText(user.id)}
                className="text-sm py-2.5"
              >
                Salin ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(user)}
                className="text-sm py-2.5"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                disabled={isCurrentUser}
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
