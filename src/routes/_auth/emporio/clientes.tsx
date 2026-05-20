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
import { formatarCPF, formatarTelefone, formatarMoeda, linkWhatsApp } from "@/lib/format";

export const Route = createFileRoute("/_auth/emporio/clientes")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("clientes_emporio", "clientes-emp", "*", { column: "nome", ascending: true });
  const upsert = useUpsert("clientes_emporio", ["clientes-emp"]);
  const del = useDelete("clientes_emporio", ["clientes-emp"]);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", email: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync(form);
    setOpen(false); setForm({ nome: "", cpf: "", telefone: "", email: "" });
  };

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Base de clientes do Empório" action={
        <RoleGate action="write"><Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo cliente</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2"><Label>Nome *</Label><Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>CPF</Label><Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></div>
                <div className="space-y-2"><Label>Telefone *</Label><Input required value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <DialogFooter><Button type="submit" disabled={upsert.isPending}>Salvar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog></RoleGate>
      } />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>CPF</TableHead><TableHead>Telefone</TableHead><TableHead className="text-right">Total compras</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem clientes</TableCell></TableRow>}
            {data.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{formatarCPF(c.cpf)}</TableCell>
                <TableCell><a href={linkWhatsApp(c.telefone)} target="_blank" rel="noreferrer" className="text-secondary hover:underline">{formatarTelefone(c.telefone)}</a></TableCell>
                <TableCell className="text-right">{formatarMoeda(c.valor_total_compras)}</TableCell>
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