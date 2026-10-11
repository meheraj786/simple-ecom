"use client";

import * as React from "react";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  MapPinned,
  MessageSquareText,
  Package,
  ShoppingCart,
  Star,
  Tags,
} from "lucide-react";

const navigation = [
  { title: "Dashboard", url: "/admin", icon: <LayoutDashboard /> },
  { title: "Products", url: "/admin/product", icon: <Package /> },
  { title: "Categories", url: "/admin/categories", icon: <Tags /> },
  { title: "Divisions", url: "/admin/division", icon: <MapPinned /> },
  { title: "Orders", url: "/admin/order", icon: <ShoppingCart /> },
  { title: "Messages", url: "/admin/messages", icon: <MessageSquareText /> },
  { title: "Reviews", url: "/admin/review", icon: <Star /> },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useCurrentUser();
  const user = currentUser.data;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/admin" />}
            >
              <span className="flex size-6 items-center justify-center bg-primary text-xs font-semibold text-primary-foreground">
                E
              </span>
              <span className="text-base font-semibold">E-Com Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "Administrator",
            email: user?.email ?? "Loading account...",
            avatar: user?.avatar ?? null,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
