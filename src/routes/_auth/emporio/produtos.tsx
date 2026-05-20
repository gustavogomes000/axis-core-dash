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
import { formatarMoeda } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_auth/emporio/produtos")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("produtos", "produtos", "*", { column: "nome", ascending: true });
  const upsert = useUpsert("produtos", ["produtos"]);
  const del = useDelete("produtos", ["produtos"]);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", sku: "", preco: 0, preco_custo: 0, estoque: 0, estoque_minimo: 0 });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsert.mutateAsync(form);
    setOpen(false); setForm({ nome: "", sku: "", preco: 0, preco_custo: 0, estoque: 0, estoque_minimo: 0 });
  };

  return (
    <div>
      <PageHeader title="Produtos" subtitle="Catálogo da loja" action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo produto</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-2"><Label>Nome *</Label><Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                <div className="space-y-2"><Label>Estoque</Label><Input type="number" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Preço *</Label><Input type="number" step="0.01" required value={form.preco} onChange={(e) => setForm({ ...form, preco: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Custo</Label><Input type="number" step="0.01" value={form.preco_custo} onChange={(e) => setForm({ ...form, preco_custo: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Estoque mín.</Label><Input type="number" value={form.estoque_minimo} onChange={(e) => setForm({ ...form, estoque_minimo: +e.target.value })} /></div>
              </div>
              <DialogFooter><Button type="submit" disabled={upsert.isPending}>Salvar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Preço</TableHead><TableHead className="text-right">Estoque</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum produto cadastrado</TableCell></TableRow>}
            {data.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell className="text-muted-foreground">{p.sku || "—"}</TableCell>
                <TableCell className="text-right">{formatarMoeda(p.preco)}</TableCell>
                <TableCell className="text-right">{p.estoque}</TableCell>
                <TableCell>{p.estoque <= p.estoque_minimo ? <Badge variant="destructive">Baixo</Badge> : <Badge variant="secondary">OK</Badge>}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => setDelId(p.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title="Excluir produto?" description="Esta ação não pode ser desfeita." destructive onConfirm={() => { if (delId) { del.mutate(delId); setDelId(null); } }} />
    </div>
  );
}