import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { Button } from "@/components/ui/button";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppShell({ items, groupLabel, children }: { items: NavItem[]; groupLabel: string; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <ModuleSidebar items={items} groupLabel={groupLabel} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ModuleSidebar({ items, groupLabel }: { items: NavItem[]; groupLabel: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { empresaAtiva } = useEmpresa();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">S</div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-semibold text-sidebar-foreground truncate">{empresaAtiva?.nome ?? "Grupo SRSM"}</div>
                <div className="text-xs text-sidebar-foreground/60">SRSM ERP</div>
              </div>
            )}
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = path === it.url || path.startsWith(it.url + "/");
                return (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={active}>
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
      <div className="flex-1" />
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