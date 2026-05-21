-- Sprint 4: bind comissão calculation trigger to vendas
DROP TRIGGER IF EXISTS trg_calc_comissao_venda ON public.vendas;
CREATE TRIGGER trg_calc_comissao_venda
  BEFORE INSERT OR UPDATE OF status, total, comissao_pct
  ON public.vendas
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_calc_comissao_venda();
