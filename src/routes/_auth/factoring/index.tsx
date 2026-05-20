import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { StatCard } from "@/components/StatCard";
import { formatarMoeda, formatarData } from "@/lib/format";
import { FileText, AlertTriangle, Wallet, Users, Plus, Calculator, ArrowRight, ListChecks, FileMinus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingTour, checkHasRows } from "@/components/OnboardingTour";

export const Route = createFileRoute("/_auth/factoring/")({ component: Dashboard });

function Dashboard() {
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  const hoje = new Date().toISOString().slice(0, 10);
  const em7 = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

  const { data } = useQuery({
    queryKey: ["fact-dash", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const [emp, parc, cli, recentes, vencendo] = await Promise.all([
        supabase.from("emprestimos").select("valor_principal, saldo_devedor, status").eq("empresa_id", empresaId!),
        supabase.from("parcelas_emprestimo").select("valor, status, data_vencimento").eq("empresa_id", empresaId!),
        supabase.from("clientes_factoring").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId!),
        supabase.from("emprestimos").select("id,numero_contrato,valor_principal,status,created_at").eq("empresa_id", empresaId!).order("created_at", { ascending: false }).limit(5),
        supabase.from("parcelas_emprestimo").select("id,valor,data_vencimento,status,numero_parcela,total_parcelas,cliente_id").eq("empresa_id", empresaId!).neq("status", "pago").lte("data_vencimento", em7).order("data_vencimento", { ascending: true }).limit(5),
      ]);
      const ativos = (emp.data ?? []).filter((e: any) => e.status === "ativo");
      const carteira = ativos.reduce((s: number, e: any) => s + Number(e.saldo_devedor), 0);
      const emprestado = (emp.data ?? []).reduce((s: number, e: any) => s + Number(e.valor_principal), 0);
      const atrasadas = (parc.data ?? []).filter((p: any) => p.status === "atrasado");
      const aReceber = (parc.data ?? []).filter((p: any) => p.status === "pendente").reduce((s: number, p: any) => s + Number(p.valor), 0);
      return { ativos: ativos.length, carteira, emprestado, atrasadasQtd: atrasadas.length, aReceber, clientes: cli.count ?? 0, recentes: recentes.data ?? [], vencendo: vencendo.data ?? [] };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Painel Factoring</h1>
          <p className="text-sm text-muted-foreground">Carteira, recebimentos e operações</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild><Link to="/factoring/emprestimos"><Plus className="h-4 w-4 mr-1" /> Novo empréstimo</Link></Button>
          <Button asChild variant="outline"><Link to="/factoring/simulador"><Calculator className="h-4 w-4 mr-1" /> Simular</Link></Button>
          <Button asChild variant="outline"><Link to="/factoring/clientes"><Users className="h-4 w-4 mr-1" /> Novo cliente</Link></Button>
        </div>
      </div>

      <OnboardingTour
        storageKey="tour-factoring"
        passos={[
          { label: "Cadastrar primeiro cliente", to: "/factoring/clientes", check: checkHasRows("clientes_factoring") },
          { label: "Simular um empréstimo", to: "/factoring/simulador", check: async () => false },
          { label: "Criar primeiro empréstimo", to: "/factoring/emprestimos", check: checkHasRows("emprestimos") },
          { label: "Configurar taxas e mensagens", to: "/factoring/configuracoes", check: checkHasRows("config_factoring") },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Carteira ativa" value={formatarMoeda(data?.carteira ?? 0)} hint={`${data?.ativos ?? 0} contratos ativos`} icon={Wallet} />
        <StatCard label="A receber" value={formatarMoeda(data?.aReceber ?? 0)} icon={FileText} tone="secondary" />
        <StatCard label="Parcelas em atraso" value={data?.atrasadasQtd ?? 0} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Clientes" value={data?.clientes ?? 0} icon={Users} tone="muted" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fluxo de operação</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 md:grid-cols-4">
            {[
              { n: 1, label: "Simular", desc: "Calcule taxa, prazo e parcelas", to: "/factoring/simulador", icon: Calculator },
              { n: 2, label: "Cadastrar cliente", desc: "Dados, score e referências", to: "/factoring/clientes", icon: Users },
              { n: 3, label: "Criar empréstimo", desc: "Contrato e parcelas geradas", to: "/factoring/emprestimos", icon: FileText },
              { n: 4, label: "Cobrar e baixar", desc: "Receber e tratar atrasos", to: "/factoring/parcelas", icon: ListChecks },
            ].map((s) => (
              <Link key={s.n} to={s.to} className="group rounded-lg border bg-card p-3 hover:border-primary/60 hover:shadow-sm transition">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-6 w-6 grid place-items-center rounded-full bg-primary/10 text-primary text-xs font-semibold">{s.n}</span>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{s.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </Link>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link to="/factoring/inadimplentes" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><AlertTriangle className="h-3 w-3" /> Inadimplentes</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link to="/factoring/contas-pagar" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><FileMinus className="h-3 w-3" /> Contas a pagar</Link>
            <span className="text-muted-foreground/40">·</span>
            <Link to="/factoring/relatorio" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><BarChart3 className="h-3 w-3" /> Relatório</Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Próximos vencimentos</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/factoring/parcelas">Ver tudo <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(!data?.vencendo || data.vencendo.length === 0) && <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma parcela próxima do vencimento.</p>}
            {(data?.vencendo ?? []).map((p: any) => {
              const atrasada = p.data_vencimento < hoje;
              return (
                <Link key={p.id} to={atrasada ? "/factoring/inadimplentes" : "/factoring/parcelas"} className="flex items-center justify-between p-2 rounded hover:bg-muted/60">
                  <div>
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
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Empréstimos recentes</CardTitle>
            <Button asChild size="sm" variant="ghost"><Link to="/factoring/emprestimos">Ver tudo <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(!data?.recentes || data.recentes.length === 0) && <p className="text-sm text-muted-foreground py-6 text-center">Nenhum empréstimo ainda.</p>}
            {(data?.recentes ?? []).map((e: any) => (
              <Link key={e.id} to="/factoring/emprestimos" className="flex items-center justify-between p-2 rounded hover:bg-muted/60">
                <div>
                  <div className="text-sm font-medium">{e.numero_contrato}</div>
                  <div className="text-xs text-muted-foreground">{formatarData(e.created_at)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">{formatarMoeda(e.valor_principal)}</span>
                  <Badge variant={e.status === "ativo" ? "default" : "secondary"}>{e.status}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}