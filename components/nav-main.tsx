"use client";

import { ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface MenuItem {
  id: string;
  title: string;
  url: string | null;
  icon: string | null;
  order: number;
  items?: MenuItem[];
}

function getIcon(iconName: string | null) {
  if (!iconName) return null;
  const Icon = (Icons as any)[iconName];
  return Icon ? <Icon className="size-4" /> : null;
}

function MenuLevel3({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();

  // Memoize filtered items to prevent unnecessary re-renders
  const validItems = useMemo(() => items.filter((item) => item.url), [items]);

  if (validItems.length === 0) return null;

  return (
    <SidebarMenuSub className="transition-all duration-200 ease-in-out">
      {validItems.map((item) => {
        const isActive = pathname === item.url;

        return (
          <SidebarMenuSubItem
            key={item.id}
            className="transition-colors duration-150"
          >
            <SidebarMenuSubButton asChild isActive={isActive}>
              <Link
                href={item.url!}
                className="transition-all duration-150 ease-in-out"
              >
                <span>{item.title}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </SidebarMenuSub>
  );
}

function MenuLevel2({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();

  if (!items || items.length === 0) return null;

  return (
    <SidebarMenuSub className="transition-all duration-200 ease-in-out">
      {items.map((item) => {
        const hasChildren = item.items && item.items.length > 0;
        const isActive = item.url ? pathname === item.url : false;

        // Check if any grandchild is active
        const hasActiveChild = item.items?.some(
          (child) => child.url && pathname === child.url
        );

        const shouldHighlight = isActive || hasActiveChild;

        if (hasChildren) {
          return (
            <Collapsible
              key={item.id}
              asChild
              defaultOpen={shouldHighlight}
              className="group/collapsible transition-all duration-200"
            >
              <SidebarMenuSubItem className="transition-colors duration-150">
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton
                    isActive={shouldHighlight}
                    className="transition-all duration-150 ease-in-out"
                  >
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 ease-in-out group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-200 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <MenuLevel3 items={item.items || []} />
                </CollapsibleContent>
              </SidebarMenuSubItem>
            </Collapsible>
          );
        }

        // Skip menu items without URL
        if (!item.url) {
          return null;
        }

        return (
          <SidebarMenuSubItem
            key={item.id}
            className="transition-colors duration-150"
          >
            <SidebarMenuSubButton asChild isActive={isActive}>
              <Link
                href={item.url}
                className="transition-all duration-150 ease-in-out"
              >
                <span>{item.title}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </SidebarMenuSub>
  );
}

export function NavMain({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();

  // Memoize menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => items, [items]);

  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu className="transition-all duration-200 ease-in-out">
        {menuItems.map((item) => {
          const hasChildren = item.items && item.items.length > 0;
          const icon = getIcon(item.icon);

          // More precise active state checking
          const isActive = item.url ? pathname === item.url : false;

          // Check if any child or grandchild is active
          const hasActiveChild = item.items?.some((child) => {
            if (child.url && pathname === child.url) return true;
            return child.items?.some(
              (grandChild) => grandChild.url && pathname === grandChild.url
            );
          });

          // Determine if this menu should be highlighted
          const shouldHighlight = isActive || hasActiveChild;

          if (hasChildren) {
            return (
              <Collapsible
                key={item.id}
                asChild
                defaultOpen={shouldHighlight}
                className="group/collapsible transition-all duration-200"
              >
                <SidebarMenuItem className="transition-colors duration-150">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={shouldHighlight}
                      className="transition-all duration-150 ease-in-out"
                    >
                      {icon}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 ease-in-out group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="transition-all duration-200 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <MenuLevel2 items={item.items || []} />
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // Skip menu items without URL
          if (!item.url) {
            return null;
          }

          return (
            <SidebarMenuItem
              key={item.id}
              className="transition-colors duration-150"
            >
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                className="transition-all duration-150 ease-in-out"
              >
                <Link href={item.url}>
                  {icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
