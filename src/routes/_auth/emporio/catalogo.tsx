import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Copy, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/emporio/catalogo")({ component: Page });

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);

function Page() {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["config-catalogo", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("config_catalogo").select("*").eq("empresa_id", empresaId!).maybeSingle();
      return data;
    },
  });

  const { data: countProdutos } = useQuery({
    queryKey: ["catalogo-count", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { count } = await supabase.from("produtos").select("id", { count: "exact", head: true })
        .eq("empresa_id", empresaId!).eq("disponivel_catalogo", true).eq("status", "ativo");
      return count ?? 0;
    },
  });

  const [form, setForm] = useState({
    slug: "", titulo: "Catálogo de Produtos", descricao: "", whatsapp: "",
    instagram: "", facebook: "", mostrar_preco: true, mostrar_estoque: false, ativo: true,
  });

  useEffect(() => {
    if (data) {
      setForm({
        slug: data.slug ?? "",
        titulo: data.titulo ?? "Catálogo de Produtos",
        descricao: data.descricao ?? "",
        whatsapp: data.whatsapp ?? "",
        instagram: data.instagram ?? "",
        facebook: data.facebook ?? "",
        mostrar_preco: data.mostrar_preco ?? true,
        mostrar_estoque: data.mostrar_estoque ?? false,
        ativo: data.ativo ?? true,
      });
    } else if (empresaAtiva) {
      setForm((f) => ({ ...f, slug: f.slug || slugify(empresaAtiva.nome) }));
    }
  }, [data, empresaAtiva]);

  const salvar = useMutation({
    mutationFn: async () => {
      const payload = {
        empresa_id: empresaId!,
        slug: slugify(form.slug),
        titulo: form.titulo,
        descricao: form.descricao || null,
        whatsapp: form.whatsapp || null,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        mostrar_preco: form.mostrar_preco,
        mostrar_estoque: form.mostrar_estoque,
        ativo: form.ativo,
      };
      if (data?.id) {
        const { error } = await supabase.from("config_catalogo").update(payload).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("config_catalogo").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["config-catalogo"] });
      toast.success("Catálogo salvo");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const url = form.slug ? `${window.location.origin}/catalogo/${slugify(form.slug)}` : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Catálogo público" subtitle="Compartilhe seus produtos por um link" />

      {url && (
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-xs uppercase text-muted-foreground">Seu link público</div>
              <div className="font-mono text-sm break-all">{url}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {countProdutos ?? 0} produto(s) disponíveis no catálogo
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copiado"); }}>
                <Copy className="h-4 w-4 mr-2" />Copiar
              </Button>
              <Button size="sm" asChild>
                <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" />Abrir</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          {isLoading ? <div className="text-muted-foreground text-sm">Carregando…</div> : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Endereço do link (slug) *</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="minha-loja" />
                  <p className="text-xs text-muted-foreground">Apenas letras, números e hífen.</p>
                </div>
                <div className="space-y-2">
                  <Label>Título exibido</Label>
                  <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Uma frase curta sobre sua loja" />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>WhatsApp (com DDD)</Label>
                  <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="11999998888" />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@minhaloja" />
                </div>
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="minhaloja" />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.mostrar_preco} onCheckedChange={(v) => setForm({ ...form, mostrar_preco: v })} />
                  Mostrar preço
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.mostrar_estoque} onCheckedChange={(v) => setForm({ ...form, mostrar_estoque: v })} />
                  Mostrar estoque
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
                  Catálogo ativo
                </label>
              </div>
              <div className="pt-2">
                <Button onClick={() => salvar.mutate()} disabled={salvar.isPending || !form.slug.trim()}>
                  <Save className="h-4 w-4 mr-2" />Salvar configurações
                </Button>
              </div>
              <p className="text-xs text-muted-foreground border-t pt-3">
                Dica: marque cada produto como <strong>"Disponível no catálogo"</strong> em <strong>Produtos</strong> para aparecer aqui.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}