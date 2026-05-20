import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData, linkWhatsApp } from "@/lib/format";
import { diasAtraso } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_auth/factoring/inadimplentes")({ component: Page });

type Bucket = "1-15" | "16-30" | "31-60" | "60+";
const bucketize = (d: number): Bucket => d <= 15 ? "1-15" : d <= 30 ? "16-30" : d <= 60 ? "31-60" : "60+";

function Page() {
  const { empresaAtiva } = useEmpresa();
  const { data = [] } = useQuery({
    queryKey: ["inad", empresaAtiva?.id],
    enabled: !!empresaAtiva?.id,
    queryFn: async () => {
      const hoje = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("parcelas_emprestimo").select("*, emprestimos(numero_contrato, clientes_factoring(nome, telefone))").eq("empresa_id", empresaAtiva!.id).in("status", ["pendente", "atrasado"]).lt("data_vencimento", hoje).order("data_vencimento");
      return data ?? [];
    },
  });

  const [filtro, setFiltro] = useState<Bucket | "todos">("todos");

  const buckets = useMemo(() => {
    const out: Record<Bucket, { qtd: number; valor: number }> = { "1-15": { qtd: 0, valor: 0 }, "16-30": { qtd: 0, valor: 0 }, "31-60": { qtd: 0, valor: 0 }, "60+": { qtd: 0, valor: 0 } };
    for (const p of data as any[]) {
      const b = bucketize(diasAtraso(p.data_vencimento));
      out[b].qtd++; out[b].valor += Number(p.valor);
    }
    return out;
  }, [data]);

  const filtradas = useMemo(() => filtro === "todos" ? data : (data as any[]).filter((p) => bucketize(diasAtraso(p.data_vencimento)) === filtro), [data, filtro]);

  // group by cliente
  const porCliente = useMemo(() => {
    const map = new Map<string, { nome: string; telefone: string | null; parcelas: any[]; total: number; pior: number }>();
    for (const p of filtradas as any[]) {
      const nome = p.emprestimos?.clientes_factoring?.nome ?? "—";
      const tel = p.emprestimos?.clientes_factoring?.telefone ?? null;
      const k = (p.emprestimos?.clientes_factoring?.nome ?? p.cliente_id) as string;
      const dia = diasAtraso(p.data_vencimento);
      const cur = map.get(k) ?? { nome, telefone: tel, parcelas: [], total: 0, pior: 0 };
      cur.parcelas.push(p); cur.total += Number(p.valor); cur.pior = Math.max(cur.pior, dia);
      map.set(k, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.pior - a.pior);
  }, [filtradas]);

  const cobrar = (g: typeof porCliente[number]) => {
    if (!g.telefone) return;
    const linhas = g.parcelas.map((p) => `• Parcela ${p.numero_parcela}/${p.total_parcelas} (${p.emprestimos?.numero_contrato}) — venc. ${formatarData(p.data_vencimento)} — ${formatarMoeda(p.valor)}`).join("\n");
    const msg = `Olá ${g.nome}, temos parcelas em aberto:\n${linhas}\nTotal: ${formatarMoeda(g.total)}. Aguardamos seu retorno.`;
    window.open(linkWhatsApp(g.telefone, msg), "_blank");
  };

  const [aberto, setAberto] = useState<Record<string, boolean>>({});

  return (
    <div>
      <PageHeader title="Inadimplentes" subtitle="Vencidas — visão por cliente e por faixa de atraso" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {(["1-15", "16-30", "31-60", "60+"] as Bucket[]).map((b) => {
          const ativo = filtro === b;
          return (
            <button key={b} onClick={() => setFiltro(ativo ? "todos" : b)}
              className={`text-left rounded-lg border p-4 transition ${ativo ? "ring-2 ring-primary bg-primary/5" : "bg-card hover:border-primary/40"}`}>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{b} dias</div>
              <div className="text-2xl font-semibold mt-1">{buckets[b].qtd}</div>
              <div className="text-sm text-muted-foreground">{formatarMoeda(buckets[b].valor)}</div>
            </button>
          );
        })}
      </div>

      {filtro !== "todos" && (
        <div className="mb-3"><Button size="sm" variant="ghost" onClick={() => setFiltro("todos")}>Limpar filtro</Button></div>
      )}

      {porCliente.length === 0 && <Card><CardContent className="p-10 text-center text-muted-foreground">Sem inadimplência 🎉</CardContent></Card>}

      <div className="space-y-2">
        {porCliente.map((g, i) => {
          const open = aberto[g.nome];
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setAberto({ ...aberto, [g.nome]: !open })} className="flex-1 flex items-center gap-2 text-left">
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
                    <div className="flex-1">
                      <div className="font-medium">{g.nome}</div>
                      <div className="text-xs text-muted-foreground">{g.parcelas.length} parcela(s) · pior atraso {g.pior}d</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatarMoeda(g.total)}</div>
                      <Badge variant="destructive" className="mt-0.5">{bucketize(g.pior)}d</Badge>
                    </div>
                  </button>
                  {g.telefone && (
                    <Button size="sm" variant="outline" onClick={() => cobrar(g)}>
                      <MessageCircle className="h-4 w-4 mr-1" /> Cobrar
                    </Button>
                  )}
                </div>
                {open && (
                  <div className="mt-3 pl-6 border-l space-y-1 text-sm">
                    {g.parcelas.map((p) => (
                      <Link key={p.id} to="/factoring/emprestimos/$id" params={{ id: p.emprestimo_id }} className="flex items-center justify-between py-1 hover:text-primary">
                        <span>
                          <span className="font-mono text-xs text-muted-foreground mr-2">{p.emprestimos?.numero_contrato}</span>
                          Parcela {p.numero_parcela}/{p.total_parcelas} · venc. {formatarData(p.data_vencimento)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Badge variant="destructive">{diasAtraso(p.data_vencimento)}d</Badge>
                          <span className="font-medium">{formatarMoeda(p.valor)}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}