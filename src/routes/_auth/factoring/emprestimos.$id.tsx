import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MessageCircle, Printer, Settings2 } from "lucide-react";
import { formatarMoeda, formatarData, formatarDataHora, linkWhatsApp } from "@/lib/format";
import { AcoesEmprestimoDialog } from "@/components/AcoesEmprestimoDialog";
import { RegistrarPagamentoDialog } from "@/components/RegistrarPagamentoDialog";

export const Route = createFileRoute("/_auth/factoring/emprestimos/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const [acoesOpen, setAcoesOpen] = useState(false);
  const [payRow, setPayRow] = useState<any | null>(null);

  const { data: emp } = useQuery({
    queryKey: ["emprestimo-detalhe", id],
    queryFn: async () => (await supabase.from("emprestimos").select("*, clientes_factoring(nome, telefone, cpf)").eq("id", id).single()).data,
  });

  const { data: parcelas = [] } = useQuery({
    queryKey: ["parcelas-do-emp", id],
    queryFn: async () => (await supabase.from("parcelas_emprestimo").select("*").eq("emprestimo_id", id).order("numero_parcela")).data ?? [],
  });

  const { data: historico = [] } = useQuery({
    queryKey: ["hist-emp", id],
    queryFn: async () => (await supabase.from("historico_status_emprestimo").select("*").eq("emprestimo_id", id).order("created_at", { ascending: false })).data ?? [],
  });

  if (!emp) return <div className="text-muted-foreground">Carregando…</div>;

  const cliente = (emp as any).clientes_factoring;
  const proxima = parcelas.find((p: any) => p.status !== "pago");

  const imprimir = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button asChild variant="ghost" size="sm"><Link to="/factoring/emprestimos"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link></Button>
      </div>
      <PageHeader title={`Contrato ${emp.numero_contrato}`} subtitle={cliente?.nome ?? "—"} action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={imprimir}><Printer className="h-4 w-4 mr-1" /> Imprimir</Button>
          {emp.status === "ativo" && <Button onClick={() => setAcoesOpen(true)}><Settings2 className="h-4 w-4 mr-1" /> Liquidar / Renegociar</Button>}
        </div>
      } />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Status</div><div className="mt-1"><Badge variant={emp.status === "ativo" ? "default" : "secondary"}>{emp.status}</Badge></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Principal</div><div className="text-lg font-semibold">{formatarMoeda(emp.valor_principal)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Saldo devedor</div><div className="text-lg font-semibold">{formatarMoeda(emp.saldo_devedor)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">Parcela / Prazo</div><div className="text-lg font-semibold">{formatarMoeda(emp.valor_parcela)} · {emp.prazo_meses}x</div></CardContent></Card>
      </div>

      <Card><CardContent className="p-4 text-sm grid sm:grid-cols-3 gap-3">
        <div><div className="text-xs text-muted-foreground">Taxa</div><div>{Number(emp.taxa_juros).toFixed(2)}% {emp.tipo_taxa}</div></div>
        <div><div className="text-xs text-muted-foreground">Liberação</div><div>{formatarData(emp.data_liberacao)}</div></div>
        <div><div className="text-xs text-muted-foreground">1º vencimento</div><div>{formatarData(emp.data_primeiro_vencimento)}</div></div>
        {cliente?.telefone && (
          <div className="sm:col-span-3">
            <Button asChild size="sm" variant="outline">
              <a href={linkWhatsApp(cliente.telefone, `Olá ${cliente.nome}, sobre o contrato ${emp.numero_contrato}.`)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp do cliente
              </a>
            </Button>
          </div>
        )}
      </CardContent></Card>

      <div>
        <h2 className="text-sm font-semibold mb-2">Parcelas {proxima && <span className="text-muted-foreground font-normal">· próxima {proxima.numero_parcela}/{proxima.total_parcelas} em {formatarData(proxima.data_vencimento)}</span>}</h2>
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="text-right">Pago</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {parcelas.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.numero_parcela}/{p.total_parcelas}</TableCell>
                  <TableCell>{formatarData(p.data_vencimento)}</TableCell>
                  <TableCell><Badge variant={p.status === "pago" ? "default" : p.status === "atrasado" ? "destructive" : "secondary"}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right">{formatarMoeda(p.valor)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatarMoeda(p.valor_pago ?? 0)}</TableCell>
                  <TableCell className="text-right">
                    {p.status !== "pago" && <Button size="sm" onClick={() => setPayRow(p)}>Pagar</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {historico.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Histórico</h2>
          <Card><CardContent className="p-4 space-y-2 text-sm">
            {historico.map((h: any) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-32 shrink-0">{formatarDataHora(h.created_at)}</span>
                <span className="text-muted-foreground">{h.status_anterior ?? "—"}</span>
                <span>→</span>
                <Badge variant="secondary">{h.status_novo}</Badge>
                {h.motivo && <span className="text-muted-foreground">· {h.motivo}</span>}
              </div>
            ))}
          </CardContent></Card>
        </div>
      )}

      <AcoesEmprestimoDialog open={acoesOpen} onOpenChange={setAcoesOpen} emprestimo={emp} />
      <RegistrarPagamentoDialog
        open={!!payRow}
        onOpenChange={(v) => !v && setPayRow(null)}
        modo="receber"
        tabela="parcelas_emprestimo"
        registro={payRow}
        descricao={`Parcela ${payRow?.numero_parcela}/${payRow?.total_parcelas} — ${emp.numero_contrato}`}
        categoriaCaixa="emprestimo_recebimento"
        invalidate={["parcelas-do-emp", "parcelas-emp", "emprestimo-detalhe", "emprestimos", "fact-dash"]}
      />
    </div>
  );
}