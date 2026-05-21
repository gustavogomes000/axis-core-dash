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
import { Plus, Trash2, Pencil, Search, Upload, Eye, EyeOff, Star } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ImportarCSVDialog } from "@/components/ImportarCSVDialog";
import { formatarMoeda } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_auth/emporio/produtos")({ component: Page });

const VAZIO = { id: "" as string | undefined, nome: "", sku: "", preco: 0, preco_custo: 0, estoque: 0, estoque_minimo: 0, descricao_curta: "", disponivel_catalogo: true, destaque: false, imagem_url: "" };

function Page() {
  const { data = [], isLoading } = useList<any>("produtos", "produtos", "*", { column: "nome", ascending: true });
  const upsert = useUpsert("produtos", ["produtos"]);
  const del = useDelete("produtos", ["produtos"]);
  const [open, setOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [openCSV, setOpenCSV] = useState(false);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<typeof VAZIO>(VAZIO);

  const editar = (p: any) => { setForm({ id: p.id, nome: p.nome, sku: p.sku ?? "", preco: Number(p.preco ?? 0), preco_custo: Number(p.preco_custo ?? 0), estoque: Number(p.estoque ?? 0), estoque_minimo: Number(p.estoque_minimo ?? 0), descricao_curta: p.descricao_curta ?? "", disponivel_catalogo: p.disponivel_catalogo ?? true, destaque: p.destaque ?? false, imagem_url: Array.isArray(p.imagens) && p.imagens.length ? String(p.imagens[0]) : "" }); setOpen(true); };
  const novo = () => { setForm(VAZIO); setOpen(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { imagem_url, ...rest } = form as any;
    const payload: any = { ...rest, imagens: imagem_url ? [imagem_url] : [] };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setOpen(false); setForm(VAZIO);
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p: any) => (p.nome ?? "").toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q));
  }, [data, busca]);

  return (
    <div>
      <PageHeader title="Produtos" subtitle="Catálogo da loja" help={{
        storageKey: "help.produtos.v1",
        oQueE: "Cadastro de tudo que a loja vende. Cada produto tem nome, preço, estoque e pode aparecer no catálogo online.",
        passos: [
          "Clique em 'Novo produto' para cadastrar.",
          "Preencha nome, preço de venda e quantidade em estoque.",
          "Defina o estoque mínimo para ser avisado quando estiver acabando.",
          "Marque 'Disponível no catálogo' se quiser que o cliente veja online.",
          "Para editar, clique no produto na lista.",
        ],
        dicas: [
          "Use SKU (código) para encontrar produtos mais rápido nas vendas.",
          "Cadastre o preço de custo para ver sua margem real nos relatórios.",
        ],
      }} action={
        <RoleGate action="write">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenCSV(true)}><Upload className="h-4 w-4 mr-2" />Importar CSV</Button>
            <Button onClick={novo}><Plus className="h-4 w-4 mr-2" />Novo produto</Button>
          </div>
        </RoleGate>
      } />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou SKU..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>SKU</TableHead><TableHead className="text-right">Preço</TableHead><TableHead className="text-right">Estoque</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && filtrados.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Nenhum produto. Clique em "Novo produto" para começar.</TableCell></TableRow>}
            {filtrados.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell className="text-muted-foreground">{p.sku || "—"}</TableCell>
                <TableCell className="text-right">{formatarMoeda(p.preco)}</TableCell>
                <TableCell className="text-right">{p.estoque}</TableCell>
                <TableCell>{p.estoque <= p.estoque_minimo ? <Badge variant="destructive">Baixo</Badge> : <Badge variant="secondary">OK</Badge>}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {p.destaque && <Star className="h-4 w-4 text-amber-500 self-center" aria-label="Destaque" />}
                    {p.disponivel_catalogo ? <Eye className="h-4 w-4 text-muted-foreground self-center" aria-label="No catálogo" /> : <EyeOff className="h-4 w-4 text-muted-foreground/50 self-center" aria-label="Oculto" />}
                    <Button variant="ghost" size="icon" onClick={() => editar(p)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDelId(p.id)} aria-label="Excluir"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2"><Label>Nome *</Label><Input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div className="space-y-2"><Label>Estoque</Label><Input type="number" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Preço *</Label><Input type="number" step="0.01" required value={form.preco} onChange={(e) => setForm({ ...form, preco: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Custo</Label><Input type="number" step="0.01" value={form.preco_custo} onChange={(e) => setForm({ ...form, preco_custo: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Estoque mín.</Label><Input type="number" value={form.estoque_minimo} onChange={(e) => setForm({ ...form, estoque_minimo: +e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Descrição curta (catálogo)</Label><Input value={form.descricao_curta} onChange={(e) => setForm({ ...form, descricao_curta: e.target.value })} placeholder="Ex.: Sofá retrátil, tecido suede" /></div>
            <div className="space-y-2">
              <Label>Foto do produto (URL)</Label>
              <Input value={form.imagem_url} onChange={(e) => setForm({ ...form, imagem_url: e.target.value })} placeholder="https://..." />
              {form.imagem_url && <img src={form.imagem_url} alt="Pré-visualização" className="mt-2 h-24 w-24 object-cover rounded border" />}
            </div>
            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.disponivel_catalogo} onCheckedChange={(v) => setForm({ ...form, disponivel_catalogo: v })} />
                Disponível no catálogo público
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.destaque} onCheckedChange={(v) => setForm({ ...form, destaque: v })} />
                Destacar no topo
              </label>
            </div>
            <DialogFooter><Button type="submit" disabled={upsert.isPending}>Salvar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!delId} onOpenChange={(v) => !v && setDelId(null)} title="Excluir produto?" description="Esta ação não pode ser desfeita." destructive onConfirm={() => { if (delId) { del.mutate(delId); setDelId(null); } }} />
      <ImportarCSVDialog
        open={openCSV}
        onOpenChange={setOpenCSV}
        titulo="Importar produtos"
        tabela="produtos"
        invalidate={["produtos"]}
        exemploNome="produtos_exemplo.csv"
        exemploCSV={"nome,sku,preco,preco_custo,estoque,estoque_minimo\nSofá 3 lugares,SOF001,1899.90,950,5,1\nMesa de centro,MES001,499.00,220,12,2"}
        campos={[
          { key: "nome", label: "Nome", required: true },
          { key: "sku", label: "SKU" },
          { key: "preco", label: "Preço", required: true, transform: (v) => parseFloat(v.replace(",", ".")) },
          { key: "preco_custo", label: "Custo", transform: (v) => parseFloat(v.replace(",", ".")) },
          { key: "estoque", label: "Estoque", transform: (v) => parseInt(v) || 0 },
          { key: "estoque_minimo", label: "Estoque mínimo", transform: (v) => parseInt(v) || 0 },
          { key: "descricao", label: "Descrição" },
        ]}
      />
    </div>
  );
}