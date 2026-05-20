import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { toast } from "sonner";

export function useList<T = any>(table: string, key: string, select = "*", order?: { column: string; ascending?: boolean }) {
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  return useQuery({
    queryKey: [key, empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      let q: any = (supabase as any).from(table).select(select).eq("empresa_id", empresaId!);
      if (order) q = q.order(order.column, { ascending: order.ascending ?? false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useUpsert(table: string, invalidate: string[]) {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  return useMutation({
    mutationFn: async (payload: any) => {
      const row = { ...payload, empresa_id: empresaAtiva?.id };
      const { error } = await (supabase as any).from(table).upsert(row);
      if (error) throw error;
    },
    onSuccess: () => { invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success("Salvo"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDelete(table: string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast.success("Excluído"); },
    onError: (e: any) => toast.error(e.message),
  });
}