import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { useState } from "react";
import { useList, useUpsert, useDelete } from "@/hooks/useEmpresaData";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData } from "@/lib/format";

export const Route = createFileRoute("/_auth/factoring/contas-pagar")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("contas_pagar", "cp-fact", "*", { column: "data_vencimento" });
  const upsert = useUpsert("contas_pagar", ["cp-fact"]);
  const del = useDelete("contas_pagar", ["cp-fact"]);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [f, setF] = useState({ descricao: "", valor: 0, data_vencimento: "", categoria: "outros" });

  return (
    <div>
      <PageHeader title="Contas a pagar" action={
        <RoleGate action="write"><Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova conta</DialogTitle></DialogHeader>
            <form onSubmit={async (e) => { e.preventDefault(); await upsert.mutateAsync(f); setOpen(false); setF({ descricao: "", valor: 0, data_vencimento: "", categoria: "outros" }); }} className="space-y-3">
              <div className="space-y-2"><Label>Descrição *</Label><Input required value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Valor *</Label><Input type="number" step="0.01" required value={f.valor} onChange={(e) => setF({ ...f, valor: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Vencimento *</Label><Input type="date" required value={f.data_vencimento} onChange={(e) => setF({ ...f, data_vencimento: e.target.value })} /></div>
              </div>
              <DialogFooter><Button type="submit" disabled={upsert.isPending}>Salvar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog></RoleGate>
      } />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem contas</TableCell></TableRow>}
            {data.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.descricao}</TableCell>
                <TableCell>{formatarData(c.data_vencimento)}</TableCell>
                <TableCell><Badge variant={c.status === "pago" ? "default" : c.status === "atrasado" ? "destructive" : "secondary"}>{c.status}</Badge></TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(c.valor)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => setDelId(c.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title="Excluir conta?" destructive onConfirm={() => { if (delId) { del.mutate(delId); setDelId(null); } }} />
    </div>
  );
}