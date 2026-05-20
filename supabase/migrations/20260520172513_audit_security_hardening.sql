-- Auditoria: endurece RLS pública e SECURITY DEFINER

-- 1. Catálogo público de produtos: remover branch público do policy
DROP POLICY IF EXISTS produtos_select ON public.produtos;
CREATE POLICY produtos_select ON public.produtos
  FOR SELECT TO authenticated
  USING (has_empresa_access(empresa_id));

CREATE OR REPLACE VIEW public.catalogo_produtos
WITH (security_invoker = true) AS
SELECT
  p.id, p.empresa_id, p.categoria_id, p.nome, p.descricao, p.descricao_curta,
  p.preco, p.unidade, p.imagens, p.tags, p.destaque, p.status, p.sku,
  p.disponivel_catalogo, p.estoque, p.created_at
FROM public.produtos p
WHERE p.disponivel_catalogo = true
  AND p.status = 'ativo'
  AND EXISTS (
    SELECT 1 FROM public.config_catalogo c
    WHERE c.empresa_id = p.empresa_id AND c.ativo = true
  );

GRANT SELECT ON public.catalogo_produtos TO anon, authenticated;

-- Permitir leitura pública restrita via view: precisamos liberar SELECT no produtos
-- apenas para colunas seguras quando passa pela view. Como Postgres faz check de
-- RLS na tabela base mesmo via VIEW, recriamos uma policy pública só para
-- linhas elegíveis ao catálogo, sem expor preco_custo via SELECT * (a view
-- limita as colunas, mas a policy decide as linhas).
CREATE POLICY produtos_catalogo_publico ON public.produtos
  FOR SELECT TO anon
  USING (
    disponivel_catalogo = true
    AND status = 'ativo'
    AND EXISTS (
      SELECT 1 FROM public.config_catalogo c
      WHERE c.empresa_id = produtos.empresa_id AND c.ativo = true
    )
  );

-- 2. Categorias: escopar por empresa com catálogo ativo
DROP POLICY IF EXISTS categorias_select_public ON public.categorias_produto;
CREATE POLICY categorias_select_public ON public.categorias_produto
  FOR SELECT TO anon, authenticated
  USING (
    ativo = true
    AND EXISTS (
      SELECT 1 FROM public.config_catalogo c
      WHERE c.empresa_id = categorias_produto.empresa_id AND c.ativo = true
    )
  );

-- 3. SECURITY DEFINER: search_path explícito + revogar EXECUTE público
ALTER FUNCTION public.fn_marcar_parcelas_atrasadas() SET search_path = public;
ALTER FUNCTION public.fn_update_cliente_emporio_metrics() SET search_path = public;
ALTER FUNCTION public.fn_update_saldo_devedor() SET search_path = public;
ALTER FUNCTION public.fn_update_cliente_factoring_metrics() SET search_path = public;
ALTER FUNCTION public.fn_historico_status_emprestimo() SET search_path = public;
ALTER FUNCTION public.generate_numero_contrato(uuid) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.fn_marcar_parcelas_atrasadas() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_update_cliente_emporio_metrics() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_update_saldo_devedor() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_update_cliente_factoring_metrics() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fn_historico_status_emprestimo() FROM anon, authenticated, public;

REVOKE EXECUTE ON FUNCTION public.generate_numero_contrato(uuid) FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.generate_numero_contrato(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_empresa_access(uuid) FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.has_empresa_access(uuid) TO authenticated;

-- 4. Column-level: anon nunca enxerga preco_custo direto na tabela produtos
REVOKE SELECT ON public.produtos FROM anon;
GRANT SELECT (
  id, empresa_id, categoria_id, fornecedor_id, sku, nome, descricao, descricao_curta,
  preco, estoque, estoque_minimo, unidade, peso, dimensoes, imagens, tags,
  destaque, disponivel_catalogo, status, created_at, updated_at
) ON public.produtos TO anon;
