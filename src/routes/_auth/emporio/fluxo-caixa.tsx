import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useList, useUpsert } from "@/hooks/useEmpresaData";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RoleGate } from "@/components/RoleGate";

export const Route = createFileRoute("/_auth/emporio/fluxo-caixa")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("movimentacoes_caixa", "fluxo-caixa", "*", { column: "data_movimentacao" });
  const upsert = useUpsert("movimentacoes_caixa", ["fluxo-caixa"]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ tipo: "entrada", categoria: "ajuste", descricao: "", valor: 0, data_movimentacao: new Date().toISOString().slice(0, 10) });
  const entradas = data.filter((m: any) => m.tipo === "entrada").reduce((s: number, m: any) => s + Number(m.valor), 0);
  const saidas = data.filter((m: any) => m.tipo === "saida").reduce((s: number, m: any) => s + Number(m.valor), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync(f);
    setOpen(false);
    setF({ tipo: "entrada", categoria: "ajuste", descricao: "", valor: 0, data_movimentacao: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div>
      <PageHeader title="Fluxo de caixa" action={
        <RoleGate action="write"><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Lançamento</Button></RoleGate>
      } />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Entradas" value={formatarMoeda(entradas)} icon={ArrowUpCircle} />
        <StatCard label="Saídas" value={formatarMoeda(saidas)} icon={ArrowDownCircle} tone="destructive" />
        <StatCard label="Saldo" value={formatarMoeda(entradas - saidas)} icon={Wallet} tone={entradas - saidas < 0 ? "destructive" : "primary"} />
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">Sem movimentações. Use "Lançamento" para registrar entradas e saídas manuais.</TableCell></TableRow>}
            {data.map((m: any) => (
              <TableRow key={m.id}>
                <TableCell>{formatarData(m.data_movimentacao)}</TableCell>
                <TableCell>{m.descricao}</TableCell>
                <TableCell className="text-muted-foreground">{m.categoria}</TableCell>
                <TableCell><Badge variant={m.tipo === "entrada" ? "default" : "destructive"}>{m.tipo}</Badge></TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(m.valor)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo lançamento de caixa</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={f.tipo} onValueChange={(v) => setF({ ...f, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Categoria</Label><Input value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Descrição *</Label><Input required value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Valor (R$) *</Label><Input type="number" step="0.01" required value={f.valor} onChange={(e) => setF({ ...f, valor: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Data *</Label><Input type="date" required value={f.data_movimentacao} onChange={(e) => setF({ ...f, data_movimentacao: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit" disabled={upsert.isPending}>Salvar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}