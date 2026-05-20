import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData, linkWhatsApp } from "@/lib/format";
import { calcularMultaMora, diasAtraso } from "@/lib/finance";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_auth/factoring/parcelas")({ component: Page });

function Page() {
  const qc = useQueryClient();
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
  const [valor, setValor] = useState(0);
  const [data_pagamento, setDp] = useState(new Date().toISOString().slice(0, 10));

  const registrar = useMutation({
    mutationFn: async () => {
      const dias = diasAtraso(pay.data_vencimento);
      const { multa, mora } = calcularMultaMora(Number(pay.valor), dias);
      const { error } = await supabase.from("parcelas_emprestimo").update({
        status: "pago", valor_pago: valor, data_pagamento, dias_atraso: dias, multa, juros_mora: mora,
      } as any).eq("id", pay.id);
      if (error) throw error;
      // Lançamento de caixa: entrada
      await supabase.from("movimentacoes_caixa").insert({
        empresa_id: pay.empresa_id,
        tipo: "entrada",
        categoria: "emprestimo_recebimento",
        descricao: `Parcela ${pay.numero_parcela}/${pay.total_parcelas} — ${pay.emprestimos?.numero_contrato ?? ""}`,
        valor,
        referencia_tipo: "parcela_emprestimo",
        referencia_id: pay.id,
        data_movimentacao: data_pagamento,
      } as any);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["parcelas-emp"] }); setPay(null); toast.success("Pagamento registrado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const openPay = (p: any) => {
    const dias = diasAtraso(p.data_vencimento);
    const { total } = calcularMultaMora(Number(p.valor), dias);
    setValor(total); setDp(new Date().toISOString().slice(0, 10)); setPay(p);
  };

  const cobrar = (p: any) => {
    const tel = p.emprestimos?.clientes_factoring?.telefone;
    if (!tel) return;
    const template = cfg?.msg_cobranca ?? "Olá {cliente}, parcela {numero}/{total} do contrato {contrato} no valor de {valor} vence em {vencimento}.";
    const msg = template
      .replace("{cliente}", p.emprestimos?.clientes_factoring?.nome ?? "")
      .replace("{contrato}", p.emprestimos?.numero_contrato ?? "")
      .replace("{numero}", String(p.numero_parcela))
      .replace("{total}", String(p.total_parcelas))
      .replace("{valor}", formatarMoeda(p.valor))
      .replace("{vencimento}", formatarData(p.data_vencimento));
    window.open(linkWhatsApp(tel, msg), "_blank");
  };

  return (
    <div>
      <PageHeader title="Parcelas" subtitle="Todos os vencimentos" />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Contrato</TableHead><TableHead>Cliente</TableHead><TableHead>Parcela</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhuma parcela</TableCell></TableRow>}
            {data.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono">{p.emprestimos?.numero_contrato}</TableCell>
                <TableCell>{p.emprestimos?.clientes_factoring?.nome ?? "—"}</TableCell>
                <TableCell>{p.numero_parcela}/{p.total_parcelas}</TableCell>
                <TableCell>{formatarData(p.data_vencimento)}</TableCell>
                <TableCell><Badge variant={p.status === "pago" ? "default" : p.status === "atrasado" ? "destructive" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell className="text-right">{formatarMoeda(p.valor)}</TableCell>
                <TableCell>
                  {p.status !== "pago" && (
                    <div className="flex justify-end gap-1">
                      {p.emprestimos?.clientes_factoring?.telefone && (
                        <Button size="sm" variant="outline" onClick={() => cobrar(p)} title="Cobrar via WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" onClick={() => openPay(p)}>Pagar</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!pay} onOpenChange={(v) => !v && setPay(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar pagamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Parcela {pay?.numero_parcela}/{pay?.total_parcelas} — venc. {formatarData(pay?.data_vencimento)}</div>
            <div className="space-y-2"><Label>Valor pago (R$)</Label><Input type="number" step="0.01" value={valor} onChange={(e) => setValor(+e.target.value)} /></div>
            <div className="space-y-2"><Label>Data do pagamento</Label><Input type="date" value={data_pagamento} onChange={(e) => setDp(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={() => registrar.mutate()} disabled={registrar.isPending}>Confirmar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}