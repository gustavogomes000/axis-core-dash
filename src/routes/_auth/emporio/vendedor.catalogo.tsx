import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageCircle, Package } from "lucide-react";
import { formatarMoeda } from "@/lib/format";
import { gerarLinkWhatsApp, aplicarTemplate } from "@/lib/whatsapp";

export const Route = createFileRoute("/_auth/emporio/vendedor/catalogo")({ component: Page });

function Page() {
  const { empresaAtiva, loading: empresaLoading } = useEmpresa();
  const empresaId = empresaAtiva?.id;

  const [busca, setBusca] = useState("");
  const [categoriaId, setCategoriaId] = useState<string>("todas");
  const [somenteEstoque, setSomenteEstoque] = useState(true);
  const [destinatario, setDestinatario] = useState("");

  const { data: cfg } = useQuery({
    queryKey: ["config-emporio-vendedor", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("config_emporio").select("msg_orcamento, whatsapp_padrao").eq("empresa_id", empresaId!).maybeSingle();
      return data;
    },
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("categorias_produto").select("id, nome").eq("empresa_id", empresaId!).eq("ativo", true).order("nome");
      return data ?? [];
    },
  });

  const { data: produtos = [], isFetching, isError, refetch, error } = useQuery({
    queryKey: ["vendedor-produtos", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos")
        .select("id, nome, sku, preco, estoque, descricao_curta, imagens, categoria_id, destaque, status")
        .eq("empresa_id", empresaId!)
        .eq("status", "ativo")
        .order("destaque", { ascending: false })
        .order("nome");
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return (produtos as any[]).filter((p) => {
      if (categoriaId !== "todas" && p.categoria_id !== categoriaId) return false;
      if (somenteEstoque && (p.estoque ?? 0) <= 0) return false;
      if (q && !((p.nome ?? "").toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [produtos, busca, categoriaId, somenteEstoque]);

  const compartilhar = (p: any) => {
    const tpl = cfg?.msg_orcamento || "Olá! Temos *{nome}* por *R$ {valor}*. Posso reservar para você?";
    const msg = aplicarTemplate(tpl, { nome: p.nome, valor: Number(p.preco).toFixed(2), sku: p.sku ?? "" });
    const tel = destinatario || cfg?.whatsapp_padrao || "";
    const url = gerarLinkWhatsApp(tel, msg);
    if (!url) {
      // Sem destinatário: abre wa.me direto com texto para escolher contato
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
      return;
    }
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Catálogo do vendedor" subtitle="Busque, filtre e envie produtos para clientes por WhatsApp" />

      <Card>
        <CardContent className="pt-6 grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label>Buscar produto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Nome ou SKU" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {(categorias as any[]).map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>WhatsApp do cliente</Label>
            <Input placeholder="(11) 99999-9999" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} />
          </div>
          <div className="md:col-span-4 flex items-center gap-2">
            <input id="est" type="checkbox" className="h-4 w-4" checked={somenteEstoque} onChange={(e) => setSomenteEstoque(e.target.checked)} />
            <Label htmlFor="est" className="cursor-pointer">Mostrar apenas com estoque</Label>
            <span className="ml-auto text-sm text-muted-foreground">{filtrados.length} produto(s)</span>
          </div>
        </CardContent>
      </Card>

      {(empresaLoading || (!!empresaId && isFetching)) && <p className="text-muted-foreground">Carregando…</p>}

      {!empresaLoading && !empresaId && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Selecione uma empresa para abrir o catálogo do vendedor.</CardContent></Card>
      )}

      {isError && (
        <Card><CardContent className="py-8 text-center text-muted-foreground space-y-3">
          <p>Não foi possível carregar os produtos.</p>
          <p className="text-xs">{error instanceof Error ? error.message : "Erro inesperado"}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Tentar novamente</Button>
        </CardContent></Card>
      )}

      {!empresaLoading && !!empresaId && !isFetching && !isError && filtrados.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
          Nenhum produto encontrado com esses filtros.
        </CardContent></Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((p: any) => {
          const img = Array.isArray(p.imagens) && p.imagens.length ? String(p.imagens[0]) : null;
          const semEstoque = (p.estoque ?? 0) <= 0;
          return (
            <Card key={p.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {img ? <img src={img} alt={p.nome} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full grid place-items-center text-muted-foreground"><Package className="h-10 w-10" /></div>}
                {p.destaque && <Badge className="absolute top-2 left-2" variant="secondary">Destaque</Badge>}
                {semEstoque && <Badge className="absolute top-2 right-2" variant="destructive">Sem estoque</Badge>}
              </div>
              <CardContent className="pt-4 space-y-2">
                <div className="font-medium line-clamp-2">{p.nome}</div>
                {p.sku && <div className="text-xs text-muted-foreground">SKU: {p.sku}</div>}
                {p.descricao_curta && <div className="text-xs text-muted-foreground line-clamp-2">{p.descricao_curta}</div>}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-semibold">{formatarMoeda(p.preco)}</div>
                  <div className="text-xs text-muted-foreground">Est: {p.estoque}</div>
                </div>
                <Button onClick={() => compartilhar(p)} className="w-full" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" /> Enviar por WhatsApp
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}