import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { AppShell, type NavItem } from "@/components/AppShell";
import { LayoutDashboard, Calculator, Users, FileText, ListChecks, AlertTriangle, FileMinus, Settings, BarChart3 } from "lucide-react";

const items: NavItem[] = [
  { title: "Dashboard", url: "/factoring", icon: LayoutDashboard },
  { title: "Simulador", url: "/factoring/simulador", icon: Calculator },
  { title: "Clientes", url: "/factoring/clientes", icon: Users },
  { title: "Empréstimos", url: "/factoring/emprestimos", icon: FileText },
  { title: "Parcelas", url: "/factoring/parcelas", icon: ListChecks },
  { title: "Inadimplentes", url: "/factoring/inadimplentes", icon: AlertTriangle },
  { title: "Contas a Pagar", url: "/factoring/contas-pagar", icon: FileMinus },
  { title: "Relatório", url: "/factoring/relatorio", icon: BarChart3 },
  { title: "Configurações", url: "/factoring/configuracoes", icon: Settings },
];

export const Route = createFileRoute("/_auth/factoring")({ component: Layout });

function Layout() {
  const { empresaAtiva, empresas, setEmpresaAtiva } = useEmpresa();
  const nav = useNavigate();
  useEffect(() => {
    if (!empresaAtiva) {
      const e = empresas.find((x) => x.tipo === "factoring");
      if (e) setEmpresaAtiva(e);
      else if (empresas.length > 0) nav({ to: "/selecionar-empresa" });
    } else if (empresaAtiva.tipo !== "factoring") {
      const e = empresas.find((x) => x.tipo === "factoring");
      if (e) setEmpresaAtiva(e);
    }
  }, [empresaAtiva, empresas, nav, setEmpresaAtiva]);
  return (
    <AppShell items={items} groupLabel="SRS M Factoring">
      <Outlet />
    </AppShell>
  );
}