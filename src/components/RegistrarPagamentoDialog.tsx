import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatarData, formatarMoeda } from "@/lib/format";

type Modo = "receber" | "pagar";

export interface RegistrarPagamentoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  modo: Modo;
  /** Tabela alvo: parcelas_receber | parcelas_emprestimo | contas_pagar */
  tabela: "parcelas_receber" | "parcelas_emprestimo" | "contas_pagar";
  /** Registro completo da linha (precisa ter id, valor, empresa_id) */
  registro: any;
  /** Texto descritivo (ex: "Parcela 2/12 — Maria") */
  descricao: string;
  /** Categoria livre p/ movimentação de caixa */
  categoriaCaixa: string;
  /** Chaves do react-query a invalidar */
  invalidate: string[];
}

const FORMAS = [
  { v: "dinheiro", l: "Dinheiro" },
  { v: "pix", l: "PIX" },
  { v: "cartao_credito", l: "Cartão crédito" },
  { v: "cartao_debito", l: "Cartão débito" },
  { v: "boleto", l: "Boleto" },
  { v: "transferencia", l: "Transferência" },
];

export function RegistrarPagamentoDialog({ open, onOpenChange, modo, tabela, registro, descricao, categoriaCaixa, invalidate }: RegistrarPagamentoProps) {
  const qc = useQueryClient();
  const [valor, setValor] = useState<number>(0);
  const [data_pagamento, setData] = useState<string>("");
  const [tipo_pagamento, setTipo] = useState<string>("pix");

  useEffect(() => {
    if (open && registro) {
      setValor(Number(registro.valor ?? 0));
      setData(new Date().toISOString().slice(0, 10));
      setTipo("pix");
    }
  }, [open, registro]);

  const mut = useMutation({
    mutationFn: async () => {
      const valorOriginal = Number(registro.valor ?? 0);
      const valorAcumulado = Number(registro.valor_pago ?? 0) + valor;
      const quitou = valorAcumulado + 0.005 >= valorOriginal;
      const patch: any = {
        valor_pago: valorAcumulado,
        tipo_pagamento,
      };
      if (quitou) {
        patch.status = "pago";
        patch.data_pagamento = data_pagamento;
      }
      const { error } = await (supabase as any).from(tabela).update(patch).eq("id", registro.id);
      if (error) throw error;
      await supabase.from("movimentacoes_caixa").insert({
        empresa_id: registro.empresa_id,
        tipo: modo === "receber" ? "entrada" : "saida",
        categoria: categoriaCaixa,
        descricao: quitou ? descricao : `${descricao} (parcial)`,
        valor,
        referencia_tipo: tabela,
        referencia_id: registro.id,
        data_movimentacao: data_pagamento,
      } as any);
    },
    onSuccess: () => {
      invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: ["fluxo-caixa"] });
      const total = Number(registro.valor ?? 0);
      const acum = Number(registro.valor_pago ?? 0) + valor;
      toast.success(acum + 0.005 >= total ? (modo === "receber" ? "Quitado" : "Pago integralmente") : "Pagamento parcial registrado");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao registrar"),
  });

  if (!registro) return null;
  const titulo = modo === "receber" ? "Registrar recebimento" : "Registrar pagamento";
  const jaPago = Number(registro.valor_pago ?? 0);
  const saldo = Math.max(0, Number(registro.valor ?? 0) - jaPago);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            {descricao}
            {registro.data_vencimento && <> · venc. {formatarData(registro.data_vencimento)}</>}
            {" · "}valor original {formatarMoeda(Number(registro.valor ?? 0))}
            {jaPago > 0 && <> · já pago {formatarMoeda(jaPago)} · saldo {formatarMoeda(saldo)}</>}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor {modo === "receber" ? "recebido" : "pago"} (R$)</Label>
              <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(+e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={data_pagamento} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Forma</Label>
            <Select value={tipo_pagamento} onValueChange={setTipo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FORMAS.map((f) => <SelectItem key={f.v} value={f.v}>{f.l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !valor || !data_pagamento}>
            {mut.isPending ? "Salvando…" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}