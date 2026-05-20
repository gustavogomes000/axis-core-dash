import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData } from "@/lib/format";
import { calcularParcelaPrice } from "@/lib/finance";
import { gerarTabelaAmortizacao } from "@/lib/finance";
import { toast } from "sonner";
import { RoleGate } from "@/components/RoleGate";
import { AcoesEmprestimoDialog } from "@/components/AcoesEmprestimoDialog";

export const Route = createFileRoute("/_auth/factoring/emprestimos")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;

  const { data = [], isLoading } = useQuery({
    queryKey: ["emprestimos", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("emprestimos").select("*, clientes_factoring(nome)").eq("empresa_id", empresaId!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-fact-sel", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("clientes_factoring").select("id, nome").eq("empresa_id", empresaId!).order("nome");
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [acoesEmp, setAcoesEmp] = useState<any | null>(null);
  const [f, setF] = useState({ cliente_id: "", valor_principal: 5000, taxa_juros: 5, prazo_meses: 12, valor_entrada: 0, data_primeiro_vencimento: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) });

  const create = useMutation({
    mutationFn: async () => {
      const principalFinanciado = f.valor_principal - f.valor_entrada;
      const valor_parcela = calcularParcelaPrice(principalFinanciado, f.taxa_juros, f.prazo_meses);
      const total_pagar = valor_parcela * f.prazo_meses + f.valor_entrada;
      const total_juros = total_pagar - f.valor_principal;
      const { data: contrato } = await supabase.rpc("generate_numero_contrato", { p_empresa_id: empresaId! });
      const { data: emp, error } = await supabase.from("emprestimos").insert({
        empresa_id: empresaId!,
        cliente_id: f.cliente_id,
        numero_contrato: contrato as any,
        valor_principal: f.valor_principal,
        valor_entrada: f.valor_entrada,
        taxa_juros: f.taxa_juros,
        tipo_taxa: "mensal",
        prazo_meses: f.prazo_meses,
        valor_parcela,
        total_pagar,
        total_juros,
        saldo_devedor: principalFinanciado,
        data_primeiro_vencimento: f.data_primeiro_vencimento,
        data_liberacao: new Date().toISOString().slice(0, 10),
        status: "ativo",
      } as any).select("id").single();
      if (error) throw error;

      // Gera parcelas via tabela Price
      const tabela = gerarTabelaAmortizacao(principalFinanciado, f.taxa_juros, f.prazo_meses, f.data_primeiro_vencimento);
      const parcelasRows = tabela.map((p) => ({
        empresa_id: empresaId!,
        emprestimo_id: emp!.id,
        cliente_id: f.cliente_id,
        numero_parcela: p.numero,
        total_parcelas: f.prazo_meses,
        valor: p.valor,
        valor_principal: p.amortizacao,
        valor_juros: p.juros,
        saldo_devedor_antes: p.saldoAntes,
        saldo_devedor_apos: p.saldoApos,
        data_vencimento: p.vencimento,
        status: "pendente",
      }));
      const { error: errP } = await supabase.from("parcelas_emprestimo").insert(parcelasRows as any);
      if (errP) throw errP;

      // Lançamento de caixa: liberação (saída)
      await supabase.from("movimentacoes_caixa").insert({
        empresa_id: empresaId!,
        tipo: "saida",
        categoria: "emprestimo_liberacao",
        descricao: `Liberação contrato ${contrato}`,
        valor: principalFinanciado,
        referencia_tipo: "emprestimo",
        referencia_id: emp!.id,
      } as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emprestimos"] });
      qc.invalidateQueries({ queryKey: ["parcelas-emp"] });
      setOpen(false);
      toast.success("Empréstimo criado e parcelas geradas");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Empréstimos" action={
        <RoleGate action="write"><Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo empréstimo</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-3">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select value={f.cliente_id} onValueChange={(v) => setF({ ...f, cliente_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{clientes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Valor (R$) *</Label><Input type="number" step="0.01" required value={f.valor_principal} onChange={(e) => setF({ ...f, valor_principal: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Entrada</Label><Input type="number" step="0.01" value={f.valor_entrada} onChange={(e) => setF({ ...f, valor_entrada: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Taxa mensal (%) *</Label><Input type="number" step="0.01" required value={f.taxa_juros} onChange={(e) => setF({ ...f, taxa_juros: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Prazo (meses) *</Label><Input type="number" required value={f.prazo_meses} onChange={(e) => setF({ ...f, prazo_meses: +e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>1º vencimento *</Label><Input type="date" required value={f.data_primeiro_vencimento} onChange={(e) => setF({ ...f, data_primeiro_vencimento: e.target.value })} /></div>
              <div className="text-sm text-muted-foreground">Parcela estimada: <strong>{formatarMoeda(calcularParcelaPrice(f.valor_principal - f.valor_entrada, f.taxa_juros, f.prazo_meses))}</strong></div>
              <DialogFooter><Button type="submit" disabled={create.isPending || !f.cliente_id}>Criar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog></RoleGate>
      } />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Contrato</TableHead><TableHead>Cliente</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Principal</TableHead><TableHead className="text-right">Saldo</TableHead><TableHead className="w-20" /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sem empréstimos</TableCell></TableRow>}
            {data.map((e: any) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono">{e.numero_contrato}</TableCell>
                <TableCell>{e.clientes_factoring?.nome ?? "—"}</TableCell>
                <TableCell>{formatarData(e.created_at)}</TableCell>
                <TableCell><Badge variant={e.status === "ativo" ? "default" : e.status === "quitado" ? "secondary" : "outline"}>{e.status}</Badge></TableCell>
                <TableCell className="text-right">{formatarMoeda(e.valor_principal)}</TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(e.saldo_devedor)}</TableCell>
                <TableCell className="text-right">
                  {e.status === "ativo" && (
                    <Button size="icon" variant="ghost" title="Liquidar ou renegociar" onClick={() => setAcoesEmp(e)}>
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AcoesEmprestimoDialog open={!!acoesEmp} onOpenChange={(v) => !v && setAcoesEmp(null)} emprestimo={acoesEmp} />
    </div>
  );
}