import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, X, Sparkles } from "lucide-react";

export interface PassoTour {
  label: string;
  to: string;
  /** consulta para saber se o passo está concluído */
  check: (empresaId: string) => Promise<boolean>;
}

export function OnboardingTour({ passos, storageKey }: { passos: PassoTour[]; storageKey: string }) {
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  const [hidden, setHidden] = useState(() => typeof window !== "undefined" && localStorage.getItem(storageKey) === "1");

  const { data: status } = useQuery({
    queryKey: [storageKey, empresaId],
    enabled: !!empresaId && !hidden,
    queryFn: async () => Promise.all(passos.map((p) => p.check(empresaId!))),
  });

  useEffect(() => {
    if (status && status.every(Boolean)) {
      localStorage.setItem(storageKey, "1");
      setHidden(true);
    }
  }, [status, storageKey]);

  if (hidden) return null;
  const concluidos = (status ?? []).filter(Boolean).length;
  const pct = passos.length ? Math.round((concluidos / passos.length) * 100) : 0;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Comece por aqui</CardTitle>
        </div>
        <button onClick={() => { localStorage.setItem(storageKey, "1"); setHidden(true); }} className="text-muted-foreground hover:text-foreground" aria-label="Fechar guia">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Progress value={pct} className="h-2" />
          <span className="text-xs font-medium text-muted-foreground shrink-0">{concluidos}/{passos.length}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {passos.map((p, i) => {
            const ok = status?.[i] ?? false;
            return (
              <Link key={i} to={p.to} className={`flex items-center gap-2 p-2 rounded border ${ok ? "bg-primary/10 border-primary/20 text-muted-foreground line-through" : "bg-background hover:bg-muted/60"}`}>
                {ok ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                <span className="text-sm">{p.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export const checkHasRows = (table: string) => async (empresaId: string) => {
  const { count } = await (supabase as any).from(table).select("id", { count: "exact", head: true }).eq("empresa_id", empresaId);
  return (count ?? 0) > 0;
};