import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useRole } from "@/hooks/useRole";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatarMoeda, formatarData } from "@/lib/format";
import { Trophy, ShoppingCart, Wallet } from "lucide-react";

export const Route = createFileRoute("/_auth/emporio/comissoes")({ component: Page });

function Page() {
  const { empresaAtiva } = useEmpresa();
  const { user } = useAuth();
  const role = useRole();
  const empresaId = empresaAtiva?.id;
  const vetTodos = role.verComissaoTodos;

  const inicioMes = new Date(); inicioMes.setDate(1);
  const inicioIso = inicioMes.toISOString().slice(0, 10);

  const { data: vendas = [] } = useQuery({
    queryKey: ["comissoes", empresaId, vetTodos, user?.id],
    enabled: !!empresaId,
    queryFn: async () => {
      let q = supabase.from("vendas")
        .select("id, numero_venda, total, comissao_pct, comissao_valor, vendedor_id, created_at, clientes_emporio(nome)")
        .eq("empresa_id", empresaId!)
        .eq("status", "aprovada")
        .gte("created_at", inicioIso)
        .order("created_at", { ascending: false });
      if (!vetTodos && user?.id) q = q.eq("vendedor_id" as any, user.id);
      return (await q).data ?? [];
    },
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ["vendedores", empresaId],
    enabled: !!empresaId && vetTodos,
    queryFn: async () => {
      const { data } = await supabase.from("usuario_empresa").select("usuario_id, papel").eq("empresa_id", empresaId!).eq("ativo", true);
      const ids = (data ?? []).map((u: any) => u.usuario_id);
      if (ids.length === 0) return [];
      const { data: us } = await supabase.from("usuarios").select("id, nome, email").in("id", ids);
      return us ?? [];
    },
  });

  const nomeDe = (id?: string | null) => usuarios.find((u: any) => u.id === id)?.nome ?? usuarios.find((u: any) => u.id === id)?.email ?? "—";

  const totalVendas = (vendas as any[]).reduce((s, v) => s + Number(v.total ?? 0), 0);
  const totalComissao = (vendas as any[]).reduce((s, v) => s + Number(v.comissao_valor ?? 0), 0);

  const ranking = vetTodos
    ? Object.entries(
        (vendas as any[]).reduce<Record<string, { vendas: number; total: number; comissao: number }>>((acc, v) => {
          const k = v.vendedor_id ?? "sem";
          if (!acc[k]) acc[k] = { vendas: 0, total: 0, comissao: 0 };
          acc[k].vendas += 1;
          acc[k].total += Number(v.total ?? 0);
          acc[k].comissao += Number(v.comissao_valor ?? 0);
          return acc;
        }, {}),
      ).sort((a, b) => b[1].total - a[1].total)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Comissões" subtitle={vetTodos ? "Ranking de vendedores do mês" : "Suas vendas e sua comissão no mês"} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Vendas no mês" value={(vendas as any[]).length} icon={ShoppingCart} />
        <StatCard label="Faturamento" value={formatarMoeda(totalVendas)} icon={Wallet} tone="secondary" />
        <StatCard label={vetTodos ? "Comissão da equipe" : "Sua comissão"} value={formatarMoeda(totalComissao)} icon={Trophy} tone="primary" />
      </div>

      {vetTodos && (
        <div className="bg-card border rounded-lg">
          <div className="px-4 py-3 border-b font-medium text-sm">Ranking do mês</div>
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Vendedor</TableHead><TableHead className="text-right">Vendas</TableHead><TableHead className="text-right">Faturado</TableHead><TableHead className="text-right">Comissão</TableHead></TableRow></TableHeader>
            <TableBody>
              {ranking.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem vendas no mês</TableCell></TableRow>}
              {ranking.map(([id, r], idx) => (
                <TableRow key={id}>
                  <TableCell className="font-medium">{idx + 1}º</TableCell>
                  <TableCell>{nomeDe(id)}</TableCell>
                  <TableCell className="text-right">{r.vendas}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(r.total)}</TableCell>
                  <TableCell className="text-right font-medium">{formatarMoeda(r.comissao)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="bg-card border rounded-lg">
        <div className="px-4 py-3 border-b font-medium text-sm">Vendas do mês</div>
        <Table>
          <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Data</TableHead><TableHead>Cliente</TableHead>{vetTodos && <TableHead>Vendedor</TableHead>}<TableHead className="text-right">Total</TableHead><TableHead className="text-right">% Com.</TableHead><TableHead className="text-right">Comissão</TableHead></TableRow></TableHeader>
          <TableBody>
            {(vendas as any[]).length === 0 && <TableRow><TableCell colSpan={vetTodos ? 7 : 6} className="text-center text-muted-foreground">Nenhuma venda no mês</TableCell></TableRow>}
            {(vendas as any[]).map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono">#{v.numero_venda}</TableCell>
                <TableCell>{formatarData(v.created_at)}</TableCell>
                <TableCell>{v.clientes_emporio?.nome ?? "—"}</TableCell>
                {vetTodos && <TableCell>{nomeDe(v.vendedor_id)}</TableCell>}
                <TableCell className="text-right">{formatarMoeda(v.total)}</TableCell>
                <TableCell className="text-right">{Number(v.comissao_pct ?? 0)}%</TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(v.comissao_valor ?? 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}