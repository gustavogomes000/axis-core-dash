import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatarMoeda, linkWhatsApp } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/catalogo/$slug")({ component: Page });

function Page() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["catalogo", slug],
    queryFn: async () => {
      const { data: cfg } = await supabase.from("config_catalogo").select("*").eq("slug", slug).eq("ativo", true).maybeSingle();
      if (!cfg) return null;
      const { data: produtos } = await supabase
        .from("produtos")
        .select("id, nome, descricao_curta, preco, estoque, imagens, destaque, disponivel_catalogo, status")
        .eq("empresa_id", cfg.empresa_id)
        .eq("disponivel_catalogo", true)
        .eq("status", "ativo")
        .order("destaque", { ascending: false })
        .order("nome");
      return { cfg, produtos: produtos ?? [] };
    },
  });

  if (isLoading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
  if (!data) return <div className="min-h-screen grid place-items-center text-muted-foreground">Catálogo não encontrado</div>;

  const { cfg, produtos } = data;
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground py-10 px-6 text-center">
        <h1 className="text-3xl font-bold">{cfg.titulo}</h1>
        {cfg.descricao && <p className="text-sm mt-2 opacity-90 max-w-2xl mx-auto">{cfg.descricao}</p>}
      </header>
      <main className="max-w-6xl mx-auto p-6">
        {produtos.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Sem produtos disponíveis no momento.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos.map((p: any) => {
              const img = Array.isArray(p.imagens) && p.imagens[0];
              const msg = `Olá! Tenho interesse no produto: ${p.nome}`;
              return (
                <Card key={p.id} className="overflow-hidden">
                  {img && <div className="aspect-square bg-muted"><img src={img} alt={p.nome} className="w-full h-full object-cover" loading="lazy" /></div>}
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold">{p.nome}</h3>
                    {p.descricao_curta && <p className="text-sm text-muted-foreground line-clamp-2">{p.descricao_curta}</p>}
                    {cfg.mostrar_preco && <div className="text-xl font-bold text-primary">{formatarMoeda(p.preco)}</div>}
                    {cfg.whatsapp && (
                      <Button asChild className="w-full" size="sm">
                        <a href={linkWhatsApp(cfg.whatsapp, msg)} target="_blank" rel="noreferrer">
                          <MessageCircle className="h-4 w-4 mr-2" />Tenho interesse
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}