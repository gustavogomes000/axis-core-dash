DO $$ BEGIN ALTER TYPE public.papel_usuario ADD VALUE IF NOT EXISTS 'vendedor'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.papel_usuario ADD VALUE IF NOT EXISTS 'caixa'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE public.papel_usuario ADD VALUE IF NOT EXISTS 'estoquista'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.status_entrega AS ENUM ('pendente','separando','pronto','entregue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.vendas
  ADD COLUMN IF NOT EXISTS vendedor_id uuid,
  ADD COLUMN IF NOT EXISTS comissao_pct numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comissao_valor numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status_entrega public.status_entrega NOT NULL DEFAULT 'pendente';

CREATE INDEX IF NOT EXISTS idx_vendas_vendedor ON public.vendas(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status_entrega ON public.vendas(status_entrega);

CREATE TABLE IF NOT EXISTS public.metas_vendedor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  vendedor_id uuid NOT NULL,
  mes date NOT NULL,
  meta_valor numeric NOT NULL DEFAULT 0,
  comissao_pct numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, vendedor_id, mes)
);

ALTER TABLE public.metas_vendedor ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS metas_vendedor_all ON public.metas_vendedor;
CREATE POLICY metas_vendedor_all ON public.metas_vendedor
  FOR ALL USING (public.has_empresa_access(empresa_id))
  WITH CHECK (public.has_empresa_access(empresa_id));

DROP TRIGGER IF EXISTS trg_metas_vendedor_updated ON public.metas_vendedor;
CREATE TRIGGER trg_metas_vendedor_updated BEFORE UPDATE ON public.metas_vendedor
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

ALTER TABLE public.config_emporio
  ADD COLUMN IF NOT EXISTS desconto_max_sem_aprovacao numeric NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS comissao_padrao_pct numeric NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.fn_calc_comissao_venda()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $fn$
BEGIN
  IF NEW.status = 'aprovada' AND COALESCE(NEW.comissao_pct,0) > 0 THEN
    NEW.comissao_valor := ROUND((NEW.total * NEW.comissao_pct / 100)::numeric, 2);
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_calc_comissao_venda ON public.vendas;
CREATE TRIGGER trg_calc_comissao_venda BEFORE INSERT OR UPDATE ON public.vendas
  FOR EACH ROW EXECUTE FUNCTION public.fn_calc_comissao_venda();
