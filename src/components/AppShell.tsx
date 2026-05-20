import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { LogOut, Building2, Search } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/components/NotificationsBell";
import { CommandPalette } from "@/components/CommandPalette";
import logoFactoring from "@/assets/brand/logo-factoring.png";
import logoEmporio from "@/assets/brand/logo-emporio.png";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export function AppShell({ items, groups, groupLabel, children }: { items?: NavItem[]; groups?: NavGroup[]; groupLabel: string; children: React.ReactNode }) {
  const resolvedGroups: NavGroup[] = groups ?? [{ label: groupLabel, items: items ?? [] }];
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <ModuleSidebar groups={resolvedGroups} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
        <CommandPalette />
      </div>
    </SidebarProvider>
  );
}

function ModuleSidebar({ groups }: { groups: NavGroup[] }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { empresaAtiva } = useEmpresa();
  const logo = empresaAtiva?.tipo === "emporio" ? logoEmporio : empresaAtiva?.tipo === "factoring" ? logoFactoring : null;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-md bg-sidebar-accent grid place-items-center overflow-hidden shrink-0">
              {logo ? (
                <img src={logo} alt="" className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-secondary font-serif text-lg">S</span>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-serif text-sidebar-foreground truncate">{empresaAtiva?.nome ?? "Grupo SRSM"}</div>
                <div className="text-[10px] uppercase tracking-widest text-secondary">Grupo SRSM</div>
              </div>
            )}
          </div>
        </div>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => {
                  const active = path === it.url || (it.url !== "/factoring" && it.url !== "/emporio" && path.startsWith(it.url + "/"));
                  const exact = path === it.url;
                  return (
                    <SidebarMenuItem key={it.url}>
                      <SidebarMenuButton asChild isActive={active || exact}>
                        <Link to={it.url} className="flex items-center gap-2">
                          <it.icon className="h-4 w-4" />
                          {!collapsed && <span>{it.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

function Header() {
  const { user, signOut } = useAuth();
  const { empresaAtiva } = useEmpresa();
  const nav = useNavigate();
  return (
    <header className="h-14 border-b bg-background flex items-center px-4 gap-3">
      <SidebarTrigger />
      <button
        onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
        className="hidden md:flex items-center gap-2 text-sm text-muted-foreground border rounded-md px-3 py-1.5 hover:bg-muted/60 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Buscar…</span>
        <kbd className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded border">Ctrl K</kbd>
      </button>
      <div className="flex-1" />
      <NotificationsBell />
      <Button variant="ghost" size="sm" onClick={() => nav({ to: "/selecionar-empresa" })}>
        <Building2 className="h-4 w-4 mr-2" /> {empresaAtiva?.nome ?? "Selecionar empresa"}
      </Button>
      <div className="text-sm text-muted-foreground hidden md:block">{user?.email}</div>
      <Button variant="ghost" size="icon" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  );
}