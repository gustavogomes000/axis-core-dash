import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface CatalogoPublicoDTO {
  cfg: {
    slug: string;
    titulo: string;
    descricao: string | null;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    mostrar_preco: boolean;
    mostrar_estoque: boolean;
  };
  produtos: Array<{
    id: string;
    nome: string;
    descricao_curta: string | null;
    preco: number | null;
    estoque: number | null;
    imagens: unknown;
    destaque: boolean | null;
  }>;
}

export async function fetchCatalogoPublicoBySlug(slug: string): Promise<CatalogoPublicoDTO | null> {
  const { data: cfg, error: cfgError } = await supabaseAdmin
    .from("config_catalogo")
    .select("empresa_id, slug, titulo, descricao, whatsapp, instagram, facebook, mostrar_preco, mostrar_estoque")
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();

  if (cfgError) throw new Error(`Erro ao carregar catálogo: ${cfgError.message}`);
  if (!cfg) return null;

  const { data: produtos, error: produtosError } = await supabaseAdmin
    .from("produtos")
    .select("id, nome, descricao_curta, preco, estoque, imagens, destaque")
    .eq("empresa_id", cfg.empresa_id)
    .eq("disponivel_catalogo", true)
    .eq("status", "ativo")
    .order("destaque", { ascending: false })
    .order("nome", { ascending: true })
    .limit(200);

  if (produtosError) throw new Error(`Erro ao carregar produtos: ${produtosError.message}`);

  return {
    cfg: {
      slug: cfg.slug,
      titulo: cfg.titulo,
      descricao: cfg.descricao,
      whatsapp: cfg.whatsapp,
      instagram: cfg.instagram,
      facebook: cfg.facebook,
      mostrar_preco: cfg.mostrar_preco,
      mostrar_estoque: cfg.mostrar_estoque,
    },
    produtos: (produtos ?? []).map((produto) => ({
      id: produto.id,
      nome: produto.nome,
      descricao_curta: produto.descricao_curta,
      preco: produto.preco == null ? null : Number(produto.preco),
      estoque: produto.estoque == null ? null : Number(produto.estoque),
      imagens: produto.imagens,
      destaque: produto.destaque,
    })),
  };
}