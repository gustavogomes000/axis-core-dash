import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { AppShell, type NavItem } from "@/components/AppShell";
import { LayoutDashboard, Package, Users, ShoppingCart, Wallet, Settings, BookOpen, FileMinus, FilePlus } from "lucide-react";

const items: NavItem[] = [
  { title: "Dashboard", url: "/emporio", icon: LayoutDashboard },
  { title: "Produtos", url: "/emporio/produtos", icon: Package },
  { title: "Clientes", url: "/emporio/clientes", icon: Users },
  { title: "Vendas", url: "/emporio/vendas", icon: ShoppingCart },
  { title: "Fluxo de Caixa", url: "/emporio/fluxo-caixa", icon: Wallet },
  { title: "Contas a Pagar", url: "/emporio/contas-pagar", icon: FileMinus },
  { title: "Contas a Receber", url: "/emporio/contas-receber", icon: FilePlus },
  { title: "Catálogo", url: "/emporio/catalogo", icon: BookOpen },
  { title: "Configurações", url: "/emporio/configuracoes", icon: Settings },
];

export const Route = createFileRoute("/_auth/emporio")({ component: Layout });

function Layout() {
  const { empresaAtiva, empresas, setEmpresaAtiva } = useEmpresa();
  const nav = useNavigate();
  useEffect(() => {
    if (!empresaAtiva) {
      const e = empresas.find((x) => x.tipo === "emporio");
      if (e) setEmpresaAtiva(e);
      else if (empresas.length > 0) nav({ to: "/selecionar-empresa" });
    } else if (empresaAtiva.tipo !== "emporio") {
      const e = empresas.find((x) => x.tipo === "emporio");
      if (e) setEmpresaAtiva(e);
    }
  }, [empresaAtiva, empresas, nav, setEmpresaAtiva]);
  return (
    <AppShell items={items} groupLabel="Empório dos Móveis">
      <Outlet />
    </AppShell>
  );
}