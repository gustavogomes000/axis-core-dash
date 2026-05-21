import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/providers/AuthProvider";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Receipt, MessageCircle, Check, X } from "lucide-react";
import { formatarMoeda, formatarData, linkWhatsApp } from "@/lib/format";
import { addMeses } from "@/lib/finance";
import { abrirRecibo, textoReciboWhatsApp, type DadosRecibo } from "@/lib/recibo";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/emporio/vendas")({ component: Page });

type Item = { produto_id: string; nome_produto: string; sku_produto?: string | null; quantidade: number; preco_unitario: number; total: number };

function Page() {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  const role = useRole();
  const { user } = useAuth();

  const { data = [], isLoading } = useQuery({
    queryKey: ["vendas", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("vendas").select("*, clientes_emporio(nome, telefone), itens_venda(*)").eq("empresa_id", empresaId!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-emp-sel", empresaId],
    enabled: !!empresaId,
    queryFn: async () => (await supabase.from("clientes_emporio").select("id, nome").eq("empresa_id", empresaId!).order("nome")).data ?? [],
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-sel", empresaId],
    enabled: !!empresaId,
    queryFn: async () => (await supabase.from("produtos").select("id, nome, sku, preco, estoque").eq("empresa_id", empresaId!).order("nome")).data ?? [],
  });

  const { data: cfg } = useQuery({
    queryKey: ["config-emporio", empresaId],
    enabled: !!empresaId,
    queryFn: async () => (await supabase.from("config_emporio").select("*").eq("empresa_id", empresaId!).maybeSingle()).data,
  });
  const limitesPorPapel = ((cfg as any)?.desconto_max_por_papel ?? {}) as Record<string, number>;
  const fallbackMax = Number((cfg as any)?.desconto_max_sem_aprovacao ?? 10);
  const descontoMaxPct = role.papel
    ? Number(limitesPorPapel[role.papel] ?? fallbackMax)
    : 0;
  const comissaoPadraoPct = Number((cfg as any)?.comissao_padrao_pct ?? 0);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [cliente_id, setCliente] = useState<string>("");
  const [data_entrega, setDataEntrega] = useState<string>("");
  const [itens, setItens] = useState<Item[]>([]);
  const [prodSel, setProdSel] = useState<string>("");
  const [qtd, setQtd] = useState(1);
  const [tipo_pagamento, setTipo] = useState<string>("pix");
  const [parcelas, setParcelas] = useState(1);
  const [valor_entrada, setEntrada] = useState(0);
  const [desconto, setDesconto] = useState(0);

  const subtotal = itens.reduce((s, i) => s + i.total, 0);
  const total = Math.max(0, subtotal - desconto);
  const descontoPct = subtotal > 0 ? (desconto / subtotal) * 100 : 0;
  const precisaAprovacao = descontoPct > descontoMaxPct;

  const reset = () => {
    setStep(1); setCliente(""); setDataEntrega(""); setItens([]); setProdSel(""); setQtd(1);
    setTipo("pix"); setParcelas(1); setEntrada(0); setDesconto(0);
  };

  const addItem = () => {
    const p = produtos.find((x: any) => x.id === prodSel);
    if (!p) return;
    const estoque = Number(p.estoque ?? 0);
    if (qtd > estoque) {
      if (!role.approve) {
        toast.error(`Sem estoque suficiente (${estoque} disponível). Solicite ao gerente.`);
        return;
      }
      if (!window.confirm(`Estoque atual: ${estoque}. Confirmar venda de ${qtd} mesmo assim?`)) return;
    }
    setItens([...itens, { produto_id: p.id, nome_produto: p.nome, sku_produto: p.sku, quantidade: qtd, preco_unitario: Number(p.preco), total: qtd * Number(p.preco) }]);
    setProdSel(""); setQtd(1);
  };

  const create = useMutation({
    mutationFn: async (opts: { comoOrcamento?: boolean } = {}) => {
      if (valor_entrada > total) throw new Error("Entrada não pode ser maior que o total");
      if (parcelas > 1 && !cliente_id) throw new Error("Venda parcelada exige cliente cadastrado");
      // 1) cria venda
      const numero_venda = Date.now();
      const statusVenda = opts.comoOrcamento || precisaAprovacao ? "orcamento" : "aprovada";
      const { data: venda, error } = await supabase.from("vendas").insert({
        empresa_id: empresaId!,
        cliente_id: cliente_id || null,
        numero_venda,
        subtotal, desconto, total,
        tipo_pagamento: tipo_pagamento as any,
        parcelas,
        valor_entrada,
        data_entrega: data_entrega || null,
        status: statusVenda,
        vendedor_id: user?.id ?? null,
        comissao_pct: comissaoPadraoPct,
      } as any).select("id").single();
      if (error) throw error;

      // 2) itens
      const { error: errI } = await supabase.from("itens_venda").insert(
        itens.map((i) => ({ ...i, venda_id: venda!.id, desconto: 0 })) as any
      );
      if (errI) throw errI;

      // 3) baixa de estoque
      if (statusVenda === "aprovada") for (const it of itens) {
        const prod = produtos.find((x: any) => x.id === it.produto_id);
        if (!prod) continue;
        const novo = Math.max(0, Number(prod.estoque ?? 0) - it.quantidade);
        await supabase.from("produtos").update({ estoque: novo } as any).eq("id", it.produto_id);
      }

      // 4) parcelas a receber (se parcelado)
      const aReceber = total - valor_entrada;
      if (parcelas > 1 && aReceber > 0 && statusVenda === "aprovada") {
        const valorParcela = Math.round((aReceber / parcelas) * 100) / 100;
        const base = new Date().toISOString().slice(0, 10);
        const rows = Array.from({ length: parcelas }, (_, k) => ({
          empresa_id: empresaId!,
          venda_id: venda!.id,
          cliente_id: cliente_id || null,
          numero_parcela: k + 1,
          total_parcelas: parcelas,
          valor: valorParcela,
          data_vencimento: addMeses(base, k + 1),
          status: "pendente",
        }));
        await supabase.from("parcelas_receber").insert(rows as any);
      }

      // 5) caixa: entrada à vista ou entrada inicial (só se aprovada)
      const valorCaixa = parcelas > 1 ? valor_entrada : total;
      if (valorCaixa > 0 && statusVenda === "aprovada") {
        await supabase.from("movimentacoes_caixa").insert({
          empresa_id: empresaId!,
          tipo: "entrada",
          categoria: "venda",
          descricao: `Venda #${numero_venda}`,
          valor: valorCaixa,
          referencia_tipo: "venda",
          referencia_id: venda!.id,
        } as any);
      }
      return { statusVenda, comoOrcamento: !!opts.comoOrcamento };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["produtos-sel"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      toast.success(
        res?.comoOrcamento
          ? "Orçamento salvo (não baixou estoque)"
          : res?.statusVenda === "orcamento"
            ? "Enviada para aprovação do gerente (desconto acima do limite)"
            : "Venda registrada",
      );
      setOpen(false); reset();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [rejeitarId, setRejeitarId] = useState<string | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  const aprovar = useMutation({
    mutationFn: async (v: any) => {
      const { error } = await supabase
        .from("vendas")
        .update({ status: "aprovada", aprovado_por: user?.id ?? null, aprovado_em: new Date().toISOString() } as any)
        .eq("id", v.id);
      if (error) throw error;
      const valorCaixa = (v.parcelas ?? 1) > 1 ? Number(v.valor_entrada ?? 0) : Number(v.total ?? 0);
      if (valorCaixa > 0) {
        await supabase.from("movimentacoes_caixa").insert({
          empresa_id: empresaId!,
          tipo: "entrada",
          categoria: "venda",
          descricao: `Venda #${v.numero_venda} (aprovada)`,
          valor: valorCaixa,
          referencia_tipo: "venda",
          referencia_id: v.id,
        } as any);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendas"] }); toast.success("Venda aprovada"); },
    onError: (e: any) => toast.error(e.message),
  });

  const rejeitar = useMutation({
    mutationFn: async () => {
      if (!rejeitarId) return;
      const venda = data.find((v: any) => v.id === rejeitarId);
      const { error } = await supabase
        .from("vendas")
        .update({ status: "cancelada", motivo_rejeicao: motivoRejeicao || "Sem motivo informado", aprovado_por: user?.id ?? null, aprovado_em: new Date().toISOString() } as any)
        .eq("id", rejeitarId);
      if (error) throw error;
      // devolve estoque
      for (const it of venda?.itens_venda ?? []) {
        if (!it.produto_id) continue;
        const { data: p } = await supabase.from("produtos").select("estoque").eq("id", it.produto_id).maybeSingle();
        const atual = Number((p as any)?.estoque ?? 0);
        await supabase.from("produtos").update({ estoque: atual + Number(it.quantidade ?? 0) } as any).eq("id", it.produto_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["produtos-sel"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      toast.success("Venda rejeitada e estoque devolvido");
      setRejeitarId(null); setMotivoRejeicao("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const pendentes = (data as any[]).filter((v) => v.status === "orcamento");

  const montarRecibo = (v: any): DadosRecibo => ({
    empresa: empresaAtiva?.nome ?? "Empório",
    numero: v.numero_venda,
    data: v.created_at,
    cliente: v.clientes_emporio?.nome ?? null,
    itens: (v.itens_venda ?? []).map((i: any) => ({
      nome_produto: i.nome_produto,
      quantidade: i.quantidade,
      preco_unitario: Number(i.preco_unitario),
      total: Number(i.total),
    })),
    subtotal: Number(v.subtotal ?? 0),
    desconto: Number(v.desconto ?? 0),
    total: Number(v.total ?? 0),
    forma_pagamento: v.tipo_pagamento,
    parcelas: v.parcelas,
    observacoes: v.observacoes,
  });

  const enviarWhatsApp = (v: any) => {
    const tel = v.clientes_emporio?.telefone;
    if (!tel) { toast.error("Cliente sem telefone cadastrado"); return; }
    window.open(linkWhatsApp(tel, textoReciboWhatsApp(montarRecibo(v))), "_blank");
  };

  return (
    <div>
      <PageHeader title="Vendas" subtitle="Histórico e nova venda" action={
        <RoleGate action="write"><Button onClick={() => { reset(); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova venda</Button></RoleGate>
      } />
      {role.approve && pendentes.length > 0 && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>{pendentes.length}</strong> venda(s) pendente(s) de aprovação por desconto acima do limite.
        </div>
      )}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Cliente</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Pagto</TableHead><TableHead className="w-32" /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sem vendas</TableCell></TableRow>}
            {data.map((v: any) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono">#{v.numero_venda}</TableCell>
                <TableCell>{v.clientes_emporio?.nome ?? "—"}</TableCell>
                <TableCell>{formatarData(v.created_at)}</TableCell>
                <TableCell><Badge variant={v.status === "aprovada" ? "default" : "secondary"}>{v.status}</Badge></TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(v.total)}</TableCell>
                <TableCell className="text-muted-foreground">{v.tipo_pagamento ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {v.status === "orcamento" && role.approve && (
                      <>
                        <Button size="icon" variant="ghost" title="Aprovar" onClick={() => aprovar.mutate(v)} disabled={aprovar.isPending}><Check className="h-4 w-4 text-green-600" /></Button>
                        <Button size="icon" variant="ghost" title="Rejeitar" onClick={() => { setRejeitarId(v.id); setMotivoRejeicao(""); }}><X className="h-4 w-4 text-red-600" /></Button>
                      </>
                    )}
                    <Button size="icon" variant="ghost" title="Recibo" onClick={() => abrirRecibo(montarRecibo(v))}><Receipt className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Enviar WhatsApp" onClick={() => enviarWhatsApp(v)}><MessageCircle className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!rejeitarId} onOpenChange={(v) => { if (!v) { setRejeitarId(null); setMotivoRejeicao(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rejeitar venda</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Motivo da rejeição</Label>
            <Input value={motivoRejeicao} onChange={(e) => setMotivoRejeicao(e.target.value)} placeholder="Ex.: desconto excessivo sem justificativa" />
            <p className="text-xs text-muted-foreground">O estoque será devolvido automaticamente.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejeitarId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => rejeitar.mutate()} disabled={rejeitar.isPending}>Confirmar rejeição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova venda — etapa {step} de 3</DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={cliente_id} onValueChange={setCliente}>
                  <SelectTrigger><SelectValue placeholder="Opcional — venda balcão" /></SelectTrigger>
                  <SelectContent>{clientes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de entrega</Label>
                <Input type="date" value={data_entrega} onChange={(e) => setDataEntrega(e.target.value)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_100px_auto] gap-2 items-end">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select value={prodSel} onValueChange={setProdSel}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{produtos.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome} — {formatarMoeda(p.preco)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Qtd</Label><Input type="number" min={1} value={qtd} onChange={(e) => setQtd(+e.target.value || 1)} /></div>
                <Button type="button" onClick={addItem} disabled={!prodSel}>Adicionar</Button>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead className="text-right">Qtd</TableHead><TableHead className="text-right">Preço</TableHead><TableHead className="text-right">Total</TableHead><TableHead /></TableRow></TableHeader>
                  <TableBody>
                    {itens.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum item</TableCell></TableRow>}
                    {itens.map((i, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{i.nome_produto}</TableCell>
                        <TableCell className="text-right">{i.quantidade}</TableCell>
                        <TableCell className="text-right">{formatarMoeda(i.preco_unitario)}</TableCell>
                        <TableCell className="text-right font-medium">{formatarMoeda(i.total)}</TableCell>
                        <TableCell><Button size="icon" variant="ghost" onClick={() => setItens(itens.filter((_, k) => k !== idx))}><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right text-sm">Subtotal: <strong>{formatarMoeda(subtotal)}</strong></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Forma de pagamento</Label>
                  <Select value={tipo_pagamento} onValueChange={setTipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="cartao_debito">Cartão débito</SelectItem>
                      <SelectItem value="cartao_credito">Cartão crédito</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Parcelas</Label><Input type="number" min={1} value={parcelas} onChange={(e) => setParcelas(Math.max(1, +e.target.value || 1))} /></div>
                <div className="space-y-2"><Label>Entrada (R$)</Label><Input type="number" step="0.01" value={valor_entrada} onChange={(e) => setEntrada(+e.target.value)} /></div>
                <div className="space-y-2"><Label>Desconto (R$)</Label><Input type="number" step="0.01" value={desconto} onChange={(e) => setDesconto(+e.target.value)} /></div>
              </div>
              <div className="rounded-md border p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatarMoeda(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Desconto ({descontoPct.toFixed(1)}%)</span><span>− {formatarMoeda(desconto)}</span></div>
                <div className="flex justify-between text-base"><strong>Total</strong><strong>{formatarMoeda(total)}</strong></div>
                {parcelas > 1 && (
                  <div className="flex justify-between text-muted-foreground"><span>{parcelas}x de</span><span>{formatarMoeda((total - valor_entrada) / parcelas)}</span></div>
                )}
                {precisaAprovacao && (
                  <div className="mt-2 rounded-md bg-amber-100 text-amber-900 px-2 py-1 text-xs">
                    Desconto acima do permitido ({descontoMaxPct}%). A venda será enviada para aprovação do gerente.
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Voltar</Button>
            {step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)} disabled={step === 2 && itens.length === 0}>Avançar</Button>
            ) : (
              <Button type="button" onClick={() => create.mutate()} disabled={create.isPending || itens.length === 0}>Finalizar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}