import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { AppShell, type NavGroup } from "@/components/AppShell";
import { LayoutDashboard, Calculator, Users, FileText, ListChecks, AlertTriangle, FileMinus, Settings, BarChart3 } from "lucide-react";

const groups: NavGroup[] = [
  {
    label: "Início",
    items: [{ title: "Painel", url: "/factoring", icon: LayoutDashboard }],
  },
  {
    label: "1. Operar",
    items: [
      { title: "Simulador", url: "/factoring/simulador", icon: Calculator },
      { title: "Clientes", url: "/factoring/clientes", icon: Users },
      { title: "Empréstimos", url: "/factoring/emprestimos", icon: FileText },
    ],
  },
  {
    label: "2. Acompanhar",
    items: [
      { title: "Parcelas", url: "/factoring/parcelas", icon: ListChecks },
      { title: "Inadimplentes", url: "/factoring/inadimplentes", icon: AlertTriangle },
    ],
  },
  {
    label: "3. Financeiro",
    items: [
      { title: "Contas a Pagar", url: "/factoring/contas-pagar", icon: FileMinus },
      { title: "Relatório", url: "/factoring/relatorio", icon: BarChart3 },
    ],
  },
  {
    label: "Sistema",
    items: [{ title: "Configurações", url: "/factoring/configuracoes", icon: Settings }],
  },
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
    <AppShell groups={groups} groupLabel="SRS M Factoring">
      <Outlet />
    </AppShell>
  );
}