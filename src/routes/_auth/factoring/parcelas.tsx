import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData, linkWhatsApp } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MessageCircle, Search, ExternalLink } from "lucide-react";
import { RegistrarPagamentoDialog } from "@/components/RegistrarPagamentoDialog";

export const Route = createFileRoute("/_auth/factoring/parcelas")({ component: Page });

const HOJE = new Date().toISOString().slice(0, 10);
const EM7 = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

function Page() {
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  const { data = [], isLoading } = useQuery({
    queryKey: ["parcelas-emp", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("parcelas_emprestimo").select("*, emprestimos(numero_contrato, clientes_factoring(nome, telefone))").eq("empresa_id", empresaId!).order("data_vencimento");
      return data ?? [];
    },
  });
  const { data: cfg } = useQuery({
    queryKey: ["config_factoring", empresaId],
    enabled: !!empresaId,
    queryFn: async () => (await supabase.from("config_factoring").select("msg_cobranca").eq("empresa_id", empresaId!).maybeSingle()).data,
  });
  const [pay, setPay] = useState<any>(null);
  const [tab, setTab] = useState<"hoje" | "atraso" | "prox" | "pagas" | "todas">("hoje");
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState<Record<string, boolean>>({});

  const msgFor = (p: any) => {
    const template = cfg?.msg_cobranca ?? "Olá {cliente}, parcela {numero}/{total} do contrato {contrato} no valor de {valor} vence em {vencimento}.";
    return template
      .replace("{cliente}", p.emprestimos?.clientes_factoring?.nome ?? "")
      .replace("{contrato}", p.emprestimos?.numero_contrato ?? "")
      .replace("{numero}", String(p.numero_parcela))
      .replace("{total}", String(p.total_parcelas))
      .replace("{valor}", formatarMoeda(p.valor))
      .replace("{vencimento}", formatarData(p.data_vencimento));
  };

  const cobrar = (p: any) => {
    const tel = p.emprestimos?.clientes_factoring?.telefone;
    if (!tel) { toast.error("Cliente sem telefone"); return; }
    window.open(linkWhatsApp(tel, msgFor(p)), "_blank");
  };

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return data.filter((p: any) => {
      // tab filter
      if (tab === "hoje" && !(p.status !== "pago" && p.data_vencimento === HOJE)) return false;
      if (tab === "atraso" && !(p.status !== "pago" && p.data_vencimento < HOJE)) return false;
      if (tab === "prox" && !(p.status !== "pago" && p.data_vencimento > HOJE && p.data_vencimento <= EM7)) return false;
      if (tab === "pagas" && p.status !== "pago") return false;
      // busca
      if (q) {
        const hay = `${p.emprestimos?.numero_contrato ?? ""} ${p.emprestimos?.clientes_factoring?.nome ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, tab, busca]);

  const counts = useMemo(() => {
    const out = { hoje: 0, atraso: 0, prox: 0, pagas: 0 };
    for (const p of data as any[]) {
      if (p.status === "pago") out.pagas++;
      else if (p.data_vencimento < HOJE) out.atraso++;
      else if (p.data_vencimento === HOJE) out.hoje++;
      else if (p.data_vencimento <= EM7) out.prox++;
    }
    return out;
  }, [data]);

  const selecionadas = filtradas.filter((p: any) => sel[p.id]);
  const cobrarLote = () => {
    let abertas = 0;
    for (const p of selecionadas) {
      const tel = p.emprestimos?.clientes_factoring?.telefone;
      if (!tel) continue;
      window.open(linkWhatsApp(tel, msgFor(p)), "_blank");
      abertas++;
    }
    if (abertas === 0) toast.error("Selecionadas não têm telefone");
    else toast.success(`Abertas ${abertas} conversas`);
    setSel({});
  };

  return (
    <div>
      <PageHeader title="Parcelas" subtitle="Cobrança e baixa de pagamentos" action={
        selecionadas.length > 0 ? (
          <Button onClick={cobrarLote}><MessageCircle className="h-4 w-4 mr-2" /> Cobrar {selecionadas.length} no WhatsApp</Button>
        ) : null
      } />

      <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setSel({}); }}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="hoje">Hoje <span className="ml-1 text-xs opacity-70">({counts.hoje})</span></TabsTrigger>
            <TabsTrigger value="atraso">Atrasadas <span className="ml-1 text-xs opacity-70">({counts.atraso})</span></TabsTrigger>
            <TabsTrigger value="prox">Próx. 7d <span className="ml-1 text-xs opacity-70">({counts.prox})</span></TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pagas">Pagas <span className="ml-1 text-xs opacity-70">({counts.pagas})</span></TabsTrigger>
          </TabsList>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar contrato ou cliente…" value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
          </div>
        </div>

        <TabsContent value={tab} className="mt-0">
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow>
            <TableHead className="w-8">
              <Checkbox
                checked={filtradas.length > 0 && filtradas.every((p: any) => sel[p.id])}
                onCheckedChange={(v) => {
                  const next: Record<string, boolean> = {};
                  if (v) filtradas.forEach((p: any) => (next[p.id] = true));
                  setSel(next);
                }}
              />
            </TableHead>
            <TableHead>Contrato</TableHead><TableHead>Cliente</TableHead><TableHead>Parcela</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="text-right">Pago</TableHead><TableHead />
          </TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && filtradas.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">Nenhuma parcela neste filtro.</TableCell></TableRow>}
            {filtradas.map((p: any) => {
              const atrasada = p.status !== "pago" && p.data_vencimento < HOJE;
              const hoje = p.status !== "pago" && p.data_vencimento === HOJE;
              return (
              <TableRow key={p.id} className={atrasada ? "bg-destructive/5" : hoje ? "bg-amber-500/5" : undefined}>
                <TableCell>
                  {p.status !== "pago" && (
                    <Checkbox checked={!!sel[p.id]} onCheckedChange={(v) => setSel({ ...sel, [p.id]: !!v })} />
                  )}
                </TableCell>
                <TableCell className="font-mono">
                  <Link to="/factoring/emprestimos/$id" params={{ id: p.emprestimo_id }} className="hover:underline inline-flex items-center gap-1">
                    {p.emprestimos?.numero_contrato} <ExternalLink className="h-3 w-3 opacity-50" />
                  </Link>
                </TableCell>
                <TableCell>{p.emprestimos?.clientes_factoring?.nome ?? "—"}</TableCell>
                <TableCell>{p.numero_parcela}/{p.total_parcelas}</TableCell>
                <TableCell>{formatarData(p.data_vencimento)}</TableCell>
                <TableCell><Badge variant={p.status === "pago" ? "default" : p.status === "atrasado" ? "destructive" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell className="text-right">{formatarMoeda(p.valor)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatarMoeda(p.valor_pago ?? 0)}</TableCell>
                <TableCell>
                  {p.status !== "pago" && (
                    <div className="flex justify-end gap-1">
                      {p.emprestimos?.clientes_factoring?.telefone && (
                        <Button size="sm" variant="outline" onClick={() => cobrar(p)} title="Cobrar via WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" onClick={() => setPay(p)}>Pagar</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
        </TabsContent>
      </Tabs>
      <RegistrarPagamentoDialog
        open={!!pay}
        onOpenChange={(v) => !v && setPay(null)}
        modo="receber"
        tabela="parcelas_emprestimo"
        registro={pay}
        descricao={pay ? `Parcela ${pay.numero_parcela}/${pay.total_parcelas} — ${pay.emprestimos?.numero_contrato ?? ""}` : ""}
        categoriaCaixa="emprestimo_recebimento"
        invalidate={["parcelas-emp", "emprestimos", "fact-dash", "inad"]}
      />
    </div>
  );
}