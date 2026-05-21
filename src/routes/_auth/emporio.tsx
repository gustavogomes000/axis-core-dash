import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { AppShell, type NavItem } from "@/components/AppShell";
import { LayoutDashboard, Package, Users, ShoppingCart, Wallet, Settings, BookOpen, FileMinus, FilePlus, BarChart3, Truck, Trophy, UserCog, Store, MessageCircle } from "lucide-react";
import { useRole, type Perms } from "@/hooks/useRole";

type Item = NavItem & { needs?: keyof Perms };

const ALL_ITEMS: Item[] = [
  { title: "Início", url: "/emporio", icon: LayoutDashboard },
  { title: "Vendas e orçamentos", url: "/emporio/vendas", icon: ShoppingCart, needs: "venderProdutos" },
  { title: "Entregas", url: "/emporio/entregas", icon: Truck, needs: "gerirEntrega" },
  { title: "Produtos", url: "/emporio/produtos", icon: Package, needs: "editarProduto" },
  { title: "Clientes", url: "/emporio/clientes", icon: Users },
  { title: "Catálogo público", url: "/emporio/catalogo", icon: BookOpen },
  { title: "Catálogo do vendedor", url: "/emporio/vendedor/catalogo", icon: MessageCircle, needs: "venderProdutos" },
  { title: "Perfil da loja", url: "/emporio/perfil-loja", icon: Store, needs: "config" },
  { title: "Entradas e saídas", url: "/emporio/fluxo-caixa", icon: Wallet, needs: "verFinanceiro" },
  { title: "A receber", url: "/emporio/contas-receber", icon: FilePlus, needs: "verFinanceiro" },
  { title: "A pagar", url: "/emporio/contas-pagar", icon: FileMinus, needs: "verFinanceiro" },
  { title: "Comissões", url: "/emporio/comissoes", icon: Trophy, needs: "verComissaoPropria" },
  { title: "Relatório", url: "/emporio/relatorio", icon: BarChart3, needs: "verRelatorioDono" },
  { title: "Usuários", url: "/emporio/usuarios", icon: UserCog, needs: "gerirUsuarios" },
  { title: "Configurações", url: "/emporio/configuracoes", icon: Settings, needs: "config" },
];

export const Route = createFileRoute("/_auth/emporio")({ component: Layout });

function Layout() {
  const { empresaAtiva, empresas, setEmpresaAtiva } = useEmpresa();
  const role = useRole();
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
  const items: NavItem[] = ALL_ITEMS.filter((it) => !it.needs || role[it.needs]);
  return (
    <AppShell items={items} groupLabel="Empório dos Móveis">
      <Outlet />
    </AppShell>
  );
}