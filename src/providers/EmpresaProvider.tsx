import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

export interface Empresa {
  id: string;
  nome: string;
  tipo: "emporio" | "factoring" | string;
  logo_url?: string | null;
}

interface EmpresaCtx {
  empresas: Empresa[];
  empresaAtiva: Empresa | null;
  setEmpresaAtiva: (e: Empresa) => void;
  loading: boolean;
}

const Ctx = createContext<EmpresaCtx>({ empresas: [], empresaAtiva: null, setEmpresaAtiva: () => {}, loading: true });
const STORAGE_KEY = "srsm:empresa_id";

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtiva, setAtiva] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEmpresas([]); setAtiva(null); setLoading(false); return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome, tipo, logo_url")
        .order("nome");
      if (!error && data) {
        setEmpresas(data as Empresa[]);
        const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        const found = data.find((e) => e.id === saved) as Empresa | undefined;
        if (found) setAtiva(found);
        else if (data.length === 1) setAtiva(data[0] as Empresa);
      }
      setLoading(false);
    })();
  }, [user]);

  const setEmpresaAtiva = (e: Empresa) => {
    setAtiva(e);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, e.id);
  };

  return <Ctx.Provider value={{ empresas, empresaAtiva, setEmpresaAtiva, loading }}>{children}</Ctx.Provider>;
}

export const useEmpresa = () => useContext(Ctx);