import { useRole, type Papel } from "@/hooks/useRole";
import type { ReactNode } from "react";

type Action = "view" | "write" | "delete" | "approve" | "config" | "score";

export function RoleGate({ action, fallback = null, children }: { action: Action; fallback?: ReactNode; children: ReactNode }) {
  const r = useRole();
  if (r.loading) return null;
  return r[action] ? <>{children}</> : <>{fallback}</>;
}

export function hasPermission(papel: Papel | null, action: Action): boolean {
  if (!papel) return false;
  const M: Record<Papel, Record<Action, boolean>> = {
    admin:        { view: true, write: true,  delete: true,  approve: true,  config: true,  score: true  },
    gerente:      { view: true, write: true,  delete: true,  approve: true,  config: false, score: true  },
    operador:     { view: true, write: true,  delete: false, approve: false, config: false, score: false },
    visualizador: { view: true, write: false, delete: false, approve: false, config: false, score: false },
  };
  return M[papel][action];
}
