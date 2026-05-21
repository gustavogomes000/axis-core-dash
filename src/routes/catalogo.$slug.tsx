import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatarMoeda, linkWhatsApp } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram, Facebook } from "lucide-react";

export const Route = createFileRoute("/catalogo/$slug")({
  component: Page,
  head: ({ params }) => ({
    meta: [
      { title: `Catálogo · ${params.slug}` },
      { name: "description", content: "Confira nossos produtos e fale conosco pelo WhatsApp." },
      { property: "og:title", content: `Catálogo · ${params.slug}` },
      { property: "og:description", content: "Confira nossos produtos e fale conosco pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "index,follow" },
    ],
  }),
});

function Page() {
  const { slug } = Route.useParams();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["catalogo", slug],
    queryFn: async () => {
      const timeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Tempo esgotado ao carregar o catálogo.")), 12_000);
      });

      return Promise.race([
        (async () => {
          const { data: cfg, error: cfgError } = await supabase
            .from("config_catalogo")
            .select("empresa_id, slug, titulo, descricao, whatsapp, instagram, facebook, mostrar_preco, mostrar_estoque")
            .eq("slug", slug)
            .eq("ativo", true)
            .maybeSingle();

          if (cfgError) throw cfgError;
          if (!cfg) return null;

          const { data: produtos, error: produtosError } = await supabase
            .from("produtos")
            .select("id, nome, descricao_curta, preco, estoque, imagens, destaque")
            .eq("empresa_id", cfg.empresa_id)
            .eq("disponivel_catalogo", true)
            .eq("status", "ativo")
            .order("destaque", { ascending: false })
            .order("nome")
            .limit(200);

          if (produtosError) throw produtosError;
          return { cfg, produtos: produtos ?? [] };
        })(),
        timeout,
      ]);
    },
    retry: 1,
  });

  if (isPending) return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
  if (isError) return (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Não foi possível carregar o catálogo</h1>
        <p className="text-muted-foreground mt-2">Verifique sua conexão e tente novamente.</p>
        <Button className="mt-4" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    </div>
  );
  if (!data) return (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Catálogo não encontrado</h1>
        <p className="text-muted-foreground mt-2">Confira o link ou peça um novo ao lojista.</p>
      </div>
    </div>
  );

  const { cfg, produtos } = data;
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground py-10 px-6 text-center">
        <h1 className="text-3xl font-bold">{cfg.titulo}</h1>
        {cfg.descricao && <p className="text-sm mt-2 opacity-90 max-w-2xl mx-auto">{cfg.descricao}</p>}
        <div className="flex items-center justify-center gap-3 mt-4">
          {cfg.instagram && (
            <a href={`https://instagram.com/${String(cfg.instagram).replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm opacity-90 hover:opacity-100">
              <Instagram className="h-4 w-4" /> Instagram
            </a>
          )}
          {cfg.facebook && (
            <a href={`https://facebook.com/${cfg.facebook}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm opacity-90 hover:opacity-100">
              <Facebook className="h-4 w-4" /> Facebook
            </a>
          )}
        </div>
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
                    {cfg.mostrar_estoque && <div className="text-xs text-muted-foreground">{p.estoque > 0 ? `${p.estoque} em estoque` : "Sob consulta"}</div>}
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
        <footer className="text-center text-xs text-muted-foreground mt-10 pb-4">Catálogo online · atualizado em tempo real</footer>
      </main>
    </div>
  );
}