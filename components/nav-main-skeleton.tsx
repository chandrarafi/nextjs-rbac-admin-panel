import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

export function NavMainSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Skeleton className="h-3 w-20" />
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {/* Menu Item 1 - Dashboard */}
        <SidebarMenuItem>
          <SidebarMenuButton className="gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20 flex-1" />
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Menu Item 2 - User Management with submenu */}
        <SidebarMenuItem>
          <SidebarMenuButton className="gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-3 w-3 ml-auto" />
          </SidebarMenuButton>
          <SidebarMenuSub className="ml-3.5 border-l pl-3 space-y-1">
            <SidebarMenuSubItem>
              <SidebarMenuSubButton>
                <Skeleton className="h-3 w-16" />
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton>
                <Skeleton className="h-3 w-24" />
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton>
                <Skeleton className="h-3 w-20" />
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarMenuItem>

        {/* Menu Item 3 - Content with nested submenu */}
        <SidebarMenuItem>
          <SidebarMenuButton className="gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16 flex-1" />
            <Skeleton className="h-3 w-3 ml-auto" />
          </SidebarMenuButton>
          <SidebarMenuSub className="ml-3.5 border-l pl-3 space-y-1">
            <SidebarMenuSubItem>
              <SidebarMenuSubButton className="gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-3 ml-auto" />
              </SidebarMenuSubButton>
              {/* Level 3 submenu */}
              <SidebarMenuSub className="ml-3.5 border-l pl-3 space-y-1 mt-1">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>
                    <Skeleton className="h-3 w-16" />
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>
                    <Skeleton className="h-3 w-14" />
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton>
                <Skeleton className="h-3 w-10" />
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton>
                <Skeleton className="h-3 w-20" />
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </SidebarMenuItem>

        {/* Menu Item 4 - Analytics */}
        <SidebarMenuItem>
          <SidebarMenuButton className="gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20 flex-1" />
            <Skeleton className="h-3 w-3 ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Menu Item 5 - Settings */}
        <SidebarMenuItem>
          <SidebarMenuButton className="gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16 flex-1" />
            <Skeleton className="h-3 w-3 ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
