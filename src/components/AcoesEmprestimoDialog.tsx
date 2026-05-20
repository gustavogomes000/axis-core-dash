import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatarMoeda } from "@/lib/format";
import { calcularParcelaPrice, gerarTabelaAmortizacao } from "@/lib/finance";
import { toast } from "sonner";

export function AcoesEmprestimoDialog({ open, onOpenChange, emprestimo }: { open: boolean; onOpenChange: (v: boolean) => void; emprestimo: any | null; }) {
  const qc = useQueryClient();
  const empId = emprestimo?.id;

  const { data: parcelas = [] } = useQuery({
    queryKey: ["parcelas-do-emp", empId],
    enabled: !!empId && open,
    queryFn: async () => (await supabase.from("parcelas_emprestimo").select("*").eq("emprestimo_id", empId!).order("numero_parcela")).data ?? [],
  });

  const pendentes = useMemo(() => parcelas.filter((p: any) => p.status !== "pago"), [parcelas]);
  const saldoPrincipalPend = useMemo(() => pendentes.reduce((s: number, p: any) => s + Number(p.valor_principal ?? 0), 0), [pendentes]);
  const totalAbertoBruto = useMemo(() => pendentes.reduce((s: number, p: any) => s + Number(p.valor ?? 0), 0), [pendentes]);

  // Liquidação antecipada
  const [descPct, setDescPct] = useState(0);
  const valorLiquidacao = Math.max(0, saldoPrincipalPend * (1 - descPct / 100));

  const liquidar = useMutation({
    mutationFn: async () => {
      if (!emprestimo) return;
      const hoje = new Date().toISOString().slice(0, 10);
      const ids = pendentes.map((p: any) => p.id);
      if (ids.length === 0) return;
      const { error } = await supabase.from("parcelas_emprestimo")
        .update({ status: "pago", data_pagamento: hoje, valor_pago: 0, observacoes: "Liquidação antecipada" } as any)
        .in("id", ids);
      if (error) throw error;
      await supabase.from("emprestimos").update({ status: "quitado", saldo_devedor: 0, data_quitacao: hoje } as any).eq("id", emprestimo.id);
      await supabase.from("movimentacoes_caixa").insert({
        empresa_id: emprestimo.empresa_id,
        tipo: "entrada",
        categoria: "emprestimo_liquidacao",
        descricao: `Liquidação antecipada — ${emprestimo.numero_contrato}${descPct ? ` (desc ${descPct}%)` : ""}`,
        valor: valorLiquidacao,
        referencia_tipo: "emprestimo",
        referencia_id: emprestimo.id,
        data_movimentacao: hoje,
      } as any);
    },
    onSuccess: () => {
      ["emprestimos", "parcelas-emp", "parcelas-do-emp", "fluxo-caixa"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success("Empréstimo liquidado");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Renegociação
  const [novaTaxa, setNovaTaxa] = useState<number>(0);
  const [novoPrazo, setNovoPrazo] = useState<number>(0);
  const [primeiroVenc, setPrimeiroVenc] = useState<string>(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const novaParcela = novoPrazo > 0 ? calcularParcelaPrice(saldoPrincipalPend, novaTaxa, novoPrazo) : 0;

  const renegociar = useMutation({
    mutationFn: async () => {
      if (!emprestimo || novoPrazo <= 0) return;
      const hoje = new Date().toISOString().slice(0, 10);
      const ids = pendentes.map((p: any) => p.id);
      if (ids.length) {
        await supabase.from("parcelas_emprestimo")
          .update({ status: "pago", data_pagamento: hoje, valor_pago: 0, observacoes: "Renegociado" } as any)
          .in("id", ids);
      }
      const tabela = gerarTabelaAmortizacao(saldoPrincipalPend, novaTaxa, novoPrazo, primeiroVenc);
      const novoTotal = tabela.reduce((s, p) => s + p.valor, 0);
      const rows = tabela.map((p) => ({
        empresa_id: emprestimo.empresa_id,
        emprestimo_id: emprestimo.id,
        cliente_id: emprestimo.cliente_id,
        numero_parcela: p.numero,
        total_parcelas: novoPrazo,
        valor: p.valor,
        valor_principal: p.amortizacao,
        valor_juros: p.juros,
        saldo_devedor_antes: p.saldoAntes,
        saldo_devedor_apos: p.saldoApos,
        data_vencimento: p.vencimento,
        status: "pendente",
      }));
      const { error } = await supabase.from("parcelas_emprestimo").insert(rows as any);
      if (error) throw error;
      await supabase.from("emprestimos").update({
        taxa_juros: novaTaxa,
        prazo_meses: novoPrazo,
        valor_parcela: tabela[0]?.valor ?? 0,
        saldo_devedor: saldoPrincipalPend,
        total_pagar: novoTotal,
        total_juros: novoTotal - saldoPrincipalPend,
        data_primeiro_vencimento: primeiroVenc,
        status: "ativo",
        observacoes: `Renegociado em ${hoje}`,
      } as any).eq("id", emprestimo.id);
    },
    onSuccess: () => {
      ["emprestimos", "parcelas-emp", "parcelas-do-emp"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success("Contrato renegociado");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!emprestimo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ações — {emprestimo.numero_contrato}</DialogTitle>
          <DialogDescription>
            {pendentes.length} parcela(s) pendente(s) · saldo principal {formatarMoeda(saldoPrincipalPend)} · em aberto {formatarMoeda(totalAbertoBruto)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="liquidar">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="liquidar">Liquidação antecipada</TabsTrigger>
            <TabsTrigger value="renegociar">Renegociar</TabsTrigger>
          </TabsList>

          <TabsContent value="liquidar" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">Quita o saldo principal de todas as parcelas em aberto. Aplique um desconto opcional sobre o principal.</p>
            <div className="space-y-2">
              <Label>Desconto (%)</Label>
              <Input type="number" min={0} max={100} step="0.5" value={descPct} onChange={(e) => setDescPct(+e.target.value)} />
            </div>
            <div className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Saldo principal</span><span>{formatarMoeda(saldoPrincipalPend)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span>− {formatarMoeda(saldoPrincipalPend - valorLiquidacao)}</span></div>
              <div className="flex justify-between text-base font-semibold"><span>A receber</span><span>{formatarMoeda(valorLiquidacao)}</span></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={() => liquidar.mutate()} disabled={liquidar.isPending || pendentes.length === 0}>
                Confirmar liquidação
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="renegociar" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">Cancela as parcelas em aberto e gera um novo plano sobre o saldo principal.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nova taxa mensal (%)</Label><Input type="number" step="0.01" value={novaTaxa} onChange={(e) => setNovaTaxa(+e.target.value)} /></div>
              <div className="space-y-2"><Label>Novo prazo (meses)</Label><Input type="number" min={1} value={novoPrazo} onChange={(e) => setNovoPrazo(+e.target.value)} /></div>
              <div className="space-y-2 col-span-2"><Label>1º vencimento</Label><Input type="date" value={primeiroVenc} onChange={(e) => setPrimeiroVenc(e.target.value)} /></div>
            </div>
            <div className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Saldo a refinanciar</span><span>{formatarMoeda(saldoPrincipalPend)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Nova parcela estimada</span><strong>{formatarMoeda(novaParcela)}</strong></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={() => renegociar.mutate()} disabled={renegociar.isPending || novoPrazo <= 0 || pendentes.length === 0}>
                Confirmar renegociação
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}