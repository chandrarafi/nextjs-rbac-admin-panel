"use client";

import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { useSession } from "next-auth/react";

import { NavMain } from "@/components/nav-main";
import { NavMainSkeleton } from "@/components/nav-main-skeleton";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [menuItems, setMenuItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchMenu = React.useCallback(async () => {
    try {
      const response = await fetch("/api/menu", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (session) {
      fetchMenu();
    }
  }, [session, fetchMenu]);

  // Listen for menu updates
  React.useEffect(() => {
    const handleMenuUpdate = () => {
      fetchMenu();
    };

    window.addEventListener("menuUpdated", handleMenuUpdate);
    return () => {
      window.removeEventListener("menuUpdated", handleMenuUpdate);
    };
  }, [fetchMenu]);

  const userData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: "/avatars/default.jpeg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Admin Panel</span>
                  <span className="text-xs">
                    {session?.user?.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {loading ? <NavMainSkeleton /> : <NavMain items={menuItems} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
