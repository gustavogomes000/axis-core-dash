-- Sprint 6: validade de orçamento
ALTER TABLE public.vendas
  ADD COLUMN IF NOT EXISTS validade_orcamento DATE;
