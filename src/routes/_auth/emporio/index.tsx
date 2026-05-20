import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { StatCard } from "@/components/StatCard";
import { formatarMoeda, formatarData } from "@/lib/format";
import { ShoppingCart, Package, Users, Wallet, Plus, AlertTriangle, ArrowRight, Truck, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingTour, checkHasRows } from "@/components/OnboardingTour";
import { useRole } from "@/hooks/useRole";

export const Route = createFileRoute("/_auth/emporio/")({ component: Dashboard });

function Dashboard() {
  const { empresaAtiva } = useEmpresa();
  const role = useRole();
  const empresaId = empresaAtiva?.id;
  const hoje = new Date().toISOString().slice(0, 10);
  const em7 = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

  const { data } = useQuery({
    queryKey: ["emporio-dash", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const [vendas, produtos, clientes, caixa, recentes, alertas] = await Promise.all([
        supabase.from("vendas").select("total, status").eq("empresa_id", empresaId!),
        supabase.from("produtos").select("id, estoque, estoque_minimo").eq("empresa_id", empresaId!),
        supabase.from("clientes_emporio").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId!),
        supabase.from("movimentacoes_caixa").select("tipo, valor").eq("empresa_id", empresaId!),
        supabase.from("vendas").select("id,numero_venda,total,status,created_at,cliente_id").eq("empresa_id", empresaId!).order("created_at", { ascending: false }).limit(5),
        supabase.from("parcelas_receber").select("id,valor,data_vencimento,status,numero_parcela,total_parcelas").eq("empresa_id", empresaId!).neq("status", "pago").lte("data_vencimento", em7).order("data_vencimento", { ascending: true }).limit(5),
      ]);
      const totalVendas = (vendas.data ?? []).filter((v: any) => v.status === "aprovada").reduce((s: number, v: any) => s + Number(v.total), 0);
      const baixos = (produtos.data ?? []).filter((p: any) => p.estoque <= p.estoque_minimo);
      const saldo = (caixa.data ?? []).reduce((s: number, m: any) => s + (m.tipo === "entrada" ? Number(m.valor) : -Number(m.valor)), 0);
      return {
        totalVendas, qtdVendas: vendas.data?.length ?? 0,
        totalProdutos: produtos.data?.length ?? 0, estoqueBaixo: baixos.length,
        totalClientes: clientes.count ?? 0, saldo,
        recentes: recentes.data ?? [],
        alertas: alertas.data ?? [],
      };
    },
  });

  const papelLabel: Record<string, string> = {
    admin: "Dono", gerente: "Gerente", vendedor: "Vendedor",
    caixa: "Caixa", estoquista: "Estoque", operador: "Operador", visualizador: "Visualizador",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Olá! Bem-vindo ao Empório</h1>
          <p className="text-sm text-muted-foreground">
            Você está como <strong>{role.papel ? papelLabel[role.papel] : "—"}</strong>. {role.verRelatorioDono ? "Aqui está o resumo do seu negócio hoje." : "Aqui está o que você precisa hoje."}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {role.venderProdutos && <Button asChild size="lg"><Link to="/emporio/vendas"><Plus className="h-4 w-4 mr-1" /> Nova venda</Link></Button>}
          {role.registrarPagamento && <Button asChild variant="outline" size="lg"><Link to="/emporio/contas-receber"><Wallet className="h-4 w-4 mr-1" /> Registrar recebimento</Link></Button>}
          {role.gerirEntrega && <Button asChild variant="outline" size="lg"><Link to="/emporio/entregas"><Truck className="h-4 w-4 mr-1" /> Ver entregas</Link></Button>}
          {role.editarProduto && <Button asChild variant="outline"><Link to="/emporio/produtos"><Package className="h-4 w-4 mr-1" /> Produtos</Link></Button>}
          <Button asChild variant="outline"><Link to="/emporio/clientes"><Users className="h-4 w-4 mr-1" /> Clientes</Link></Button>
          {role.verComissaoPropria && <Button asChild variant="outline"><Link to="/emporio/comissoes"><Trophy className="h-4 w-4 mr-1" /> Comissões</Link></Button>}
        </div>
      </div>

      {role.verRelatorioDono && <OnboardingTour
        storageKey="tour-emporio"
        passos={[
          { label: "Cadastrar primeiro produto", to: "/emporio/produtos", check: checkHasRows("produtos") },
          { label: "Cadastrar primeiro cliente", to: "/emporio/clientes", check: checkHasRows("clientes_emporio") },
          { label: "Registrar primeira venda", to: "/emporio/vendas", check: checkHasRows("vendas") },
          { label: "Configurar dados da empresa", to: "/emporio/configuracoes", check: checkHasRows("config_emporio") },
        ]}
      />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {role.verRelatorioDono && <StatCard label="Vendas aprovadas" value={formatarMoeda(data?.totalVendas ?? 0)} hint={`${data?.qtdVendas ?? 0} vendas registradas`} icon={ShoppingCart} />}
        <StatCard label="Produtos" value={data?.totalProdutos ?? 0} hint={`${data?.estoqueBaixo ?? 0} com estoque baixo`} icon={Package} tone="secondary" />
        <StatCard label="Clientes" value={data?.totalClientes ?? 0} icon={Users} tone="muted" />
        {role.verFinanceiro && <StatCard label="Saldo de caixa" value={formatarMoeda(data?.saldo ?? 0)} icon={Wallet} tone={data && data.saldo < 0 ? "destructive" : "primary"} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {role.verFinanceiro && <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Vence em 7 dias</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/emporio/contas-receber">Ver tudo <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(!data?.alertas || data.alertas.length === 0) && <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma parcela vencendo. Tudo em dia! 🎉</p>}
            {(data?.alertas ?? []).map((p: any) => {
              const atrasada = p.data_vencimento < hoje;
              return (
                <Link key={p.id} to="/emporio/contas-receber" className="flex items-center justify-between p-2 rounded hover:bg-muted/60">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Parcela {p.numero_parcela}/{p.total_parcelas}</div>
                    <div className="text-xs text-muted-foreground">Vence {formatarData(p.data_vencimento)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold">{formatarMoeda(p.valor)}</span>
                    {atrasada && <Badge variant="destructive">Atrasada</Badge>}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Vendas recentes</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/emporio/vendas">Ver tudo <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(!data?.recentes || data.recentes.length === 0) && <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma venda ainda. Que tal registrar a primeira?</p>}
            {(data?.recentes ?? []).map((v: any) => (
              <Link key={v.id} to="/emporio/vendas" className="flex items-center justify-between p-2 rounded hover:bg-muted/60">
                <div>
                  <div className="text-sm font-medium">Venda #{v.numero_venda}</div>
                  <div className="text-xs text-muted-foreground">{formatarData(v.created_at)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">{formatarMoeda(v.total)}</span>
                  <Badge variant={v.status === "aprovada" ? "default" : "secondary"}>{v.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}