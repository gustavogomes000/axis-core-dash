import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { StatCard } from "@/components/StatCard";
import { formatarMoeda } from "@/lib/format";
import { FileText, AlertTriangle, Wallet, Users } from "lucide-react";

export const Route = createFileRoute("/_auth/factoring/")({ component: Dashboard });

function Dashboard() {
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  const { data } = useQuery({
    queryKey: ["fact-dash", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const [emp, parc, cli] = await Promise.all([
        supabase.from("emprestimos").select("valor_principal, saldo_devedor, status").eq("empresa_id", empresaId!),
        supabase.from("parcelas_emprestimo").select("valor, status, data_vencimento").eq("empresa_id", empresaId!),
        supabase.from("clientes_factoring").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId!),
      ]);
      const ativos = (emp.data ?? []).filter((e: any) => e.status === "ativo");
      const carteira = ativos.reduce((s: number, e: any) => s + Number(e.saldo_devedor), 0);
      const emprestado = (emp.data ?? []).reduce((s: number, e: any) => s + Number(e.valor_principal), 0);
      const atrasadas = (parc.data ?? []).filter((p: any) => p.status === "atrasado");
      const aReceber = (parc.data ?? []).filter((p: any) => p.status === "pendente").reduce((s: number, p: any) => s + Number(p.valor), 0);
      return { ativos: ativos.length, carteira, emprestado, atrasadasQtd: atrasadas.length, aReceber, clientes: cli.count ?? 0 };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard — Factoring</h1>
        <p className="text-sm text-muted-foreground">Carteira e operações</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Carteira ativa" value={formatarMoeda(data?.carteira ?? 0)} hint={`${data?.ativos ?? 0} contratos ativos`} icon={Wallet} />
        <StatCard label="A receber" value={formatarMoeda(data?.aReceber ?? 0)} icon={FileText} tone="secondary" />
        <StatCard label="Parcelas em atraso" value={data?.atrasadasQtd ?? 0} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Clientes" value={data?.clientes ?? 0} icon={Users} tone="muted" />
      </div>
    </div>
  );
}