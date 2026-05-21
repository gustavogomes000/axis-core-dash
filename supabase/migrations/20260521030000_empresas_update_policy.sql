-- Sprint 3: permitir admin/gerente editarem dados da empresa
CREATE POLICY empresas_update
  ON public.empresas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario_empresa ue
      WHERE ue.empresa_id = empresas.id
        AND ue.usuario_id = auth.uid()
        AND ue.ativo = TRUE
        AND ue.papel IN ('admin','gerente')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuario_empresa ue
      WHERE ue.empresa_id = empresas.id
        AND ue.usuario_id = auth.uid()
        AND ue.ativo = TRUE
        AND ue.papel IN ('admin','gerente')
    )
  );
