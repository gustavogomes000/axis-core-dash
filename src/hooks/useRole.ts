import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useEmpresa } from "@/providers/EmpresaProvider";

export type Papel = "admin" | "gerente" | "operador" | "visualizador";

const MATRIX: Record<Papel, { view: boolean; write: boolean; delete: boolean; approve: boolean; config: boolean; score: boolean }> = {
  admin:        { view: true, write: true,  delete: true,  approve: true,  config: true,  score: true  },
  gerente:      { view: true, write: true,  delete: true,  approve: true,  config: false, score: true  },
  operador:     { view: true, write: true,  delete: false, approve: false, config: false, score: false },
  visualizador: { view: true, write: false, delete: false, approve: false, config: false, score: false },
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
  return { papel, loading, ...perms, can: (action: keyof typeof MATRIX["admin"]) => perms[action] };
}
