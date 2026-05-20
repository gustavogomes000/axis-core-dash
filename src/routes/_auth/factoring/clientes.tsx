import { createFileRoute } from "@tanstack/react-router";
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
import { formatarCPF, formatarTelefone, formatarMoeda, linkWhatsApp } from "@/lib/format";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_auth/factoring/clientes")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("clientes_factoring", "clientes-fact", "*", { column: "nome", ascending: true });
  const upsert = useUpsert("clientes_factoring", ["clientes-fact"]);
  const del = useDelete("clientes_factoring", ["clientes-fact"]);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [f, setF] = useState({ nome: "", cpf: "", telefone: "", limite_credito: 0, score_interno: 50 });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync(f);
    setOpen(false); setF({ nome: "", cpf: "", telefone: "", limite_credito: 0, score_interno: 50 });
  };

  return (
    <div>
      <PageHeader title="Clientes Factoring" action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo cliente</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2"><Label>Nome *</Label><Input required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>CPF</Label><Input value={f.cpf} onChange={(e) => setF({ ...f, cpf: e.target.value })} /></div>
                <div className="space-y-2"><Label>Telefone *</Label><Input required value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Limite (R$)</Label><Input type="number" step="0.01" value={f.limite_credito} onChange={(e) => setF({ ...f, limite_credito: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Score (0-100)</Label><Input type="number" min={0} max={100} value={f.score_interno} onChange={(e) => setF({ ...f, score_interno: +e.target.value })} /></div>
              </div>
              <DialogFooter><Button type="submit" disabled={upsert.isPending}>Salvar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>CPF</TableHead><TableHead>Telefone</TableHead><TableHead>Score</TableHead><TableHead className="text-right">Limite</TableHead><TableHead className="text-right">Utilizado</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sem clientes</TableCell></TableRow>}
            {data.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{formatarCPF(c.cpf)}</TableCell>
                <TableCell><a href={linkWhatsApp(c.telefone)} target="_blank" rel="noreferrer" className="text-secondary hover:underline">{formatarTelefone(c.telefone)}</a></TableCell>
                <TableCell className="w-32"><Progress value={c.score_interno} /></TableCell>
                <TableCell className="text-right">{formatarMoeda(c.limite_credito)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatarMoeda(c.credito_utilizado)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => setDelId(c.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title="Excluir cliente?" destructive onConfirm={() => { if (delId) { del.mutate(delId); setDelId(null); } }} />
    </div>
  );
}