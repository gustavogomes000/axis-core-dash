-- Sprint 1: tabela de auditoria centralizada
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  usuario_id uuid,
  acao varchar(64) NOT NULL,
  entidade varchar(64) NOT NULL,
  entidade_id uuid,
  dados_antes jsonb,
  dados_depois jsonb,
  ip varchar(64),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_empresa_created ON public.audit_log(empresa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entidade ON public.audit_log(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario ON public.audit_log(usuario_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_select ON public.audit_log
  FOR SELECT
  USING (
    has_empresa_access(empresa_id)
    AND EXISTS (
      SELECT 1 FROM usuario_empresa ue
      WHERE ue.empresa_id = audit_log.empresa_id
        AND ue.usuario_id = auth.uid()
        AND ue.ativo = TRUE
        AND ue.papel IN ('admin', 'gerente')
    )
  );

CREATE POLICY audit_log_insert ON public.audit_log
  FOR INSERT
  WITH CHECK (has_empresa_access(empresa_id));

COMMENT ON TABLE public.audit_log IS 'Trilha de auditoria imutavel. Apenas admin/gerente leem.';
