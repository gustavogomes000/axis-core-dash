import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { StatCard } from "@/components/StatCard";
import { formatarMoeda } from "@/lib/format";
import { ShoppingCart, Package, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/_auth/emporio/")({ component: Dashboard });

function Dashboard() {
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  const { data } = useQuery({
    queryKey: ["emporio-dash", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const [vendas, produtos, clientes, caixa] = await Promise.all([
        supabase.from("vendas").select("total, status").eq("empresa_id", empresaId!),
        supabase.from("produtos").select("id, estoque, estoque_minimo").eq("empresa_id", empresaId!),
        supabase.from("clientes_emporio").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId!),
        supabase.from("movimentacoes_caixa").select("tipo, valor").eq("empresa_id", empresaId!),
      ]);
      const totalVendas = (vendas.data ?? []).filter((v: any) => v.status === "aprovada").reduce((s: number, v: any) => s + Number(v.total), 0);
      const estoqueBaixo = (produtos.data ?? []).filter((p: any) => p.estoque <= p.estoque_minimo).length;
      const saldo = (caixa.data ?? []).reduce((s: number, m: any) => s + (m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor)), 0);
      return {
        totalVendas, qtdVendas: vendas.data?.length ?? 0,
        totalProdutos: produtos.data?.length ?? 0, estoqueBaixo,
        totalClientes: clientes.count ?? 0, saldo,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard — Empório</h1>
        <p className="text-sm text-muted-foreground">Visão geral das operações</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vendas aprovadas" value={formatarMoeda(data?.totalVendas ?? 0)} hint={`${data?.qtdVendas ?? 0} vendas registradas`} icon={ShoppingCart} />
        <StatCard label="Produtos" value={data?.totalProdutos ?? 0} hint={`${data?.estoqueBaixo ?? 0} com estoque baixo`} icon={Package} tone="secondary" />
        <StatCard label="Clientes" value={data?.totalClientes ?? 0} icon={Users} tone="muted" />
        <StatCard label="Saldo de caixa" value={formatarMoeda(data?.saldo ?? 0)} icon={Wallet} tone={data && data.saldo < 0 ? "destructive" : "primary"} />
      </div>
    </div>
  );
}