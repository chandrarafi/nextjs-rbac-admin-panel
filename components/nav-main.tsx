"use client";

import { ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  if (!items || items.length === 0) return null;

  return (
    <SidebarMenuSub>
      {items.map((item) => {
        const isActive = pathname === item.url;

        return (
          <SidebarMenuSubItem key={item.id}>
            <SidebarMenuSubButton asChild isActive={isActive}>
              <Link href={item.url || "#"}>
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
    <SidebarMenuSub>
      {items.map((item) => {
        const hasChildren = item.items && item.items.length > 0;
        const isActive = pathname === item.url;
        const hasActiveChild = item.items?.some(
          (child) =>
            pathname === child.url ||
            child.items?.some((grandChild) => pathname === grandChild.url)
        );

        if (hasChildren) {
          return (
            <Collapsible
              key={item.id}
              asChild
              defaultOpen={hasActiveChild}
              className="group/collapsible"
            >
              <SidebarMenuSubItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton isActive={isActive || hasActiveChild}>
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <MenuLevel3 items={item.items || []} />
                </CollapsibleContent>
              </SidebarMenuSubItem>
            </Collapsible>
          );
        }

        return (
          <SidebarMenuSubItem key={item.id}>
            <SidebarMenuSubButton asChild isActive={isActive}>
              <Link href={item.url || "#"}>
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

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0;
          const icon = getIcon(item.icon);
          const isActive = pathname === item.url;

          // Check if any child or grandchild is active
          const hasActiveChild = item.items?.some((child) => {
            if (pathname === child.url) return true;
            return child.items?.some(
              (grandChild) => pathname === grandChild.url
            );
          });

          if (hasChildren) {
            return (
              <Collapsible
                key={item.id}
                asChild
                defaultOpen={hasActiveChild}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive || hasActiveChild}
                    >
                      {icon}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <MenuLevel2 items={item.items || []} />
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
              >
                <Link href={item.url || "#"}>
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
