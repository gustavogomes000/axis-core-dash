import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { useState, useMemo } from "react";
import { useList, useUpsert, useDelete } from "@/hooks/useEmpresaData";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatarCPF, formatarTelefone, formatarMoeda, linkWhatsApp } from "@/lib/format";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_auth/factoring/clientes")({ component: Page });

const VAZIO = { id: "" as string | undefined, nome: "", cpf: "", telefone: "", limite_credito: 0, score_interno: 50 };

function Page() {
  const { data = [], isLoading } = useList<any>("clientes_factoring", "clientes-fact", "*", { column: "nome", ascending: true });
  const upsert = useUpsert("clientes_factoring", ["clientes-fact"]);
  const del = useDelete("clientes_factoring", ["clientes-fact"]);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [f, setF] = useState<typeof VAZIO>(VAZIO);

  const editar = (c: any) => { setF({ id: c.id, nome: c.nome, cpf: c.cpf ?? "", telefone: c.telefone ?? "", limite_credito: Number(c.limite_credito ?? 0), score_interno: Number(c.score_interno ?? 0) }); setOpen(true); };
  const novo = () => { setF(VAZIO); setOpen(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...f };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setOpen(false); setF(VAZIO);
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c: any) => (c.nome ?? "").toLowerCase().includes(q) || (c.cpf ?? "").includes(q) || (c.telefone ?? "").includes(q));
  }, [data, busca]);

  return (
    <div>
      <PageHeader title="Clientes Factoring" action={
        <RoleGate action="write"><Button onClick={novo}><Plus className="h-4 w-4 mr-2" />Novo cliente</Button></RoleGate>
      } />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, CPF ou telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>CPF</TableHead><TableHead>Telefone</TableHead><TableHead>Score</TableHead><TableHead className="text-right">Limite</TableHead><TableHead className="text-right">Utilizado</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && filtrados.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">Nenhum cliente. Comece clicando em "Novo cliente".</TableCell></TableRow>}
            {filtrados.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{formatarCPF(c.cpf)}</TableCell>
                <TableCell><a href={linkWhatsApp(c.telefone)} target="_blank" rel="noreferrer" className="text-secondary hover:underline">{formatarTelefone(c.telefone)}</a></TableCell>
                <TableCell className="w-32"><Progress value={c.score_interno} /></TableCell>
                <TableCell className="text-right">{formatarMoeda(c.limite_credito)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatarMoeda(c.credito_utilizado)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => editar(c)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDelId(c.id)} aria-label="Excluir"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{f.id ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
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
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title="Excluir cliente?" destructive onConfirm={() => { if (delId) { del.mutate(delId); setDelId(null); } }} />
    </div>
  );
}