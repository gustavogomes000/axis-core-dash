import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useEmpresa } from "@/providers/EmpresaProvider";

export type Papel =
  | "admin"
  | "gerente"
  | "operador"
  | "visualizador"
  | "vendedor"
  | "caixa"
  | "estoquista";

export interface Perms {
  // ações genéricas (compat)
  view: boolean;
  write: boolean;
  delete: boolean;
  approve: boolean;
  config: boolean;
  score: boolean;
  // ações específicas do Empório
  verCusto: boolean;
  verFinanceiro: boolean;
  verRelatorioDono: boolean;
  editarProduto: boolean;
  editarEstoque: boolean;
  registrarPagamento: boolean;
  gerirEntrega: boolean;
  gerirUsuarios: boolean;
  verComissaoPropria: boolean;
  verComissaoTodos: boolean;
  venderProdutos: boolean;
}

const MATRIX: Record<Papel, Perms> = {
  admin: {
    view: true, write: true, delete: true, approve: true, config: true, score: true,
    verCusto: true, verFinanceiro: true, verRelatorioDono: true,
    editarProduto: true, editarEstoque: true, registrarPagamento: true,
    gerirEntrega: true, gerirUsuarios: true,
    verComissaoPropria: true, verComissaoTodos: true, venderProdutos: true,
  },
  gerente: {
    view: true, write: true, delete: true, approve: true, config: false, score: true,
    verCusto: true, verFinanceiro: true, verRelatorioDono: true,
    editarProduto: true, editarEstoque: true, registrarPagamento: true,
    gerirEntrega: true, gerirUsuarios: false,
    verComissaoPropria: true, verComissaoTodos: true, venderProdutos: true,
  },
  vendedor: {
    view: true, write: true, delete: false, approve: false, config: false, score: false,
    verCusto: false, verFinanceiro: false, verRelatorioDono: false,
    editarProduto: false, editarEstoque: false, registrarPagamento: false,
    gerirEntrega: false, gerirUsuarios: false,
    verComissaoPropria: true, verComissaoTodos: false, venderProdutos: true,
  },
  caixa: {
    view: true, write: true, delete: false, approve: false, config: false, score: false,
    verCusto: false, verFinanceiro: true, verRelatorioDono: false,
    editarProduto: false, editarEstoque: false, registrarPagamento: true,
    gerirEntrega: false, gerirUsuarios: false,
    verComissaoPropria: false, verComissaoTodos: false, venderProdutos: false,
  },
  estoquista: {
    view: true, write: true, delete: false, approve: false, config: false, score: false,
    verCusto: true, verFinanceiro: false, verRelatorioDono: false,
    editarProduto: true, editarEstoque: true, registrarPagamento: false,
    gerirEntrega: true, gerirUsuarios: false,
    verComissaoPropria: false, verComissaoTodos: false, venderProdutos: false,
  },
  operador: {
    view: true, write: true, delete: false, approve: false, config: false, score: false,
    verCusto: false, verFinanceiro: true, verRelatorioDono: false,
    editarProduto: true, editarEstoque: true, registrarPagamento: true,
    gerirEntrega: true, gerirUsuarios: false,
    verComissaoPropria: false, verComissaoTodos: false, venderProdutos: true,
  },
  visualizador: {
    view: true, write: false, delete: false, approve: false, config: false, score: false,
    verCusto: false, verFinanceiro: false, verRelatorioDono: false,
    editarProduto: false, editarEstoque: false, registrarPagamento: false,
    gerirEntrega: false, gerirUsuarios: false,
    verComissaoPropria: false, verComissaoTodos: false, venderProdutos: false,
  },
};

export function useRole() {
  const { user } = useAuth();
  const { empresaAtiva } = useEmpresa();
  const [papel, setPapel] = useState<Papel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !empresaAtiva) { setPapel(null); setLoading(false); return; }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("usuario_empresa")
        .select("papel")
        .eq("usuario_id", user.id)
        .eq("empresa_id", empresaAtiva.id)
        .eq("ativo", true)
        .maybeSingle();
      setPapel((data?.papel as Papel) ?? null);
      setLoading(false);
    })();
  }, [user, empresaAtiva]);

  const perms = papel ? MATRIX[papel] : MATRIX.visualizador;
  return { papel, loading, ...perms, can: (action: keyof Perms) => perms[action] };
}
