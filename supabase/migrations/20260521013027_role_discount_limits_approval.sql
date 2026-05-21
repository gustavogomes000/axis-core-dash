-- Sprint 2: limites de desconto por papel + fluxo de aprovação de venda

ALTER TABLE public.config_emporio
  ADD COLUMN IF NOT EXISTS desconto_max_por_papel jsonb
  NOT NULL DEFAULT '{"admin":100,"gerente":20,"operador":10,"vendedor":5,"caixa":5,"estoquista":0,"visualizador":0}'::jsonb;

ALTER TABLE public.vendas
  ADD COLUMN IF NOT EXISTS aprovado_por uuid,
  ADD COLUMN IF NOT EXISTS aprovado_em timestamptz,
  ADD COLUMN IF NOT EXISTS motivo_rejeicao text;

CREATE INDEX IF NOT EXISTS idx_vendas_pendentes_aprovacao
  ON public.vendas (empresa_id, status)
  WHERE status = 'orcamento';
