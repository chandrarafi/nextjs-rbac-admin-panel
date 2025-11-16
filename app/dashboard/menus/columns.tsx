"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Menu = {
  id: string;
  title: string;
  url: string | null;
  icon: string | null;
  order: number;
  parentId: string | null;
  roles: string;
  isActive: boolean;
  createdAt: string;
  children?: Menu[];
  parent?: { title: string } | null;
};

export const createColumns = (
  onEdit: (menu: Menu) => void,
  onDelete: (menu: Menu) => void
): ColumnDef<Menu>[] => [
  {
    accessorKey: "title",
    header: "Judul",
    cell: ({ row }) => {
      const menu = row.original;
      // Calculate level based on parentId chain
      let level = 0;
      if (menu.parentId) {
        level = 1;
        // Check if parent has a parent (level 3)
        if (menu.parent) {
          level = 2;
        }
      }

      return (
        <div className="flex items-center gap-1">
          {level > 0 && (
            <span
              className="text-muted-foreground flex items-center"
              style={{ marginLeft: `${level * 20}px` }}
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
          <span
            className={
              level === 0
                ? "font-semibold"
                : level === 1
                ? "font-medium"
                : "font-normal"
            }
          >
            {menu.title}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const url = row.getValue("url") as string | null;
      return (
        <div className="text-muted-foreground font-mono text-sm">
          {url || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => {
      const icon = row.getValue("icon") as string | null;
      return <div className="text-muted-foreground text-sm">{icon || "-"}</div>;
    },
  },
  {
    accessorKey: "order",
    header: "Urutan",
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("order")}</div>;
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const rolesString = row.getValue("roles") as string | null;
      if (!rolesString) return <div className="text-muted-foreground">-</div>;
      const roles = rolesString.split(",").map((r) => r.trim());
      return (
        <div className="flex gap-1 flex-wrap">
          {roles.map((role, index) => (
            <Badge
              key={`${role}-${index}`}
              variant="outline"
              className="text-xs"
            >
              {role}
            </Badge>
          ))}
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
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const menu = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(menu.id)}
            >
              Salin ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(menu)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(menu)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
