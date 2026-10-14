"use client"

import Link from "next/link"
import { ExternalLink, FolderKanban, ImageIcon, LayoutDashboard, Mail, Settings, ShieldCheck } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface NavItem {
  href: string
  label: string
  icon: typeof Mail
  exact?: boolean
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Général",
    items: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Contenu",
    items: [
      { href: "/admin/projects", label: "Projets", icon: FolderKanban },
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/media", label: "Médias", icon: ImageIcon },
    ],
  },
  {
    label: "Configuration",
    items: [{ href: "/admin/settings", label: "Paramètres", icon: Settings }],
  },
]

export const navItems: NavItem[] = groups.flatMap((g) => g.items)

/** Active item: tinted with the signal accent and a thin indicator bar on the left edge. */
const itemClass =
  "relative h-9 rounded-lg text-sidebar-foreground/75 hover:text-sidebar-foreground " +
  "data-active:bg-signal/10 data-active:text-signal data-active:hover:bg-signal/15 data-active:hover:text-signal " +
  "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-signal " +
  "before:opacity-0 before:transition-opacity data-active:before:opacity-100 " +
  "group-data-[collapsible=icon]:before:hidden"

export function AppSidebar({ pathname, unread }: { pathname: string; unread: number }) {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="rounded-xl" render={<Link href="/admin" />}>
              <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-signal to-infra text-primary-foreground shadow-lg shadow-signal/25">
                <ShieldCheck className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-display text-[0.95rem] font-semibold">Administration</span>
                <span className="font-mono text-[0.68rem] text-sidebar-foreground/55">Portfolio</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-1">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="py-2">
            <SidebarGroupLabel className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-sidebar-foreground/45">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={active}
                      className={itemClass}
                      render={<Link href={item.href} aria-current={active ? "page" : undefined} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.href === "/admin/messages" && unread > 0 && (
                      <SidebarMenuBadge className="top-2! right-2 h-5 min-w-5 rounded-full bg-signal font-mono text-[0.68rem] text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-active/menu-button:text-primary-foreground">
                        {unread}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group/site flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-2.5 text-sm transition-colors hover:border-signal/40 hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
          aria-label="Voir le site (nouvel onglet)"
        >
          <ExternalLink className="hidden size-4 shrink-0 group-data-[collapsible=icon]:block" aria-hidden="true" />
          <span className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="block truncate font-medium">Voir le site</span>
            <span className="block truncate text-xs text-sidebar-foreground/55">Ouvre le portfolio public</span>
          </span>
          <ExternalLink
            className="size-3.5 shrink-0 text-sidebar-foreground/45 transition-colors group-hover/site:text-signal group-data-[collapsible=icon]:hidden"
            aria-hidden="true"
          />
        </a>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
