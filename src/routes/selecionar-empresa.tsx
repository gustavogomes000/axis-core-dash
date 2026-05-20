import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, LogOut } from "lucide-react";

export const Route = createFileRoute("/selecionar-empresa")({ component: Page });

function Page() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { empresas, setEmpresaAtiva, loading } = useEmpresa();
  const nav = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/login" });
  }, [authLoading, user, nav]);

  const go = (e: typeof empresas[number]) => {
    setEmpresaAtiva(e);
    nav({ to: e.tipo === "factoring" ? "/factoring" : "/emporio" });
  };

  return (
    <div className="min-h-screen p-6 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Selecione a empresa</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Carregando empresas…</p>
        ) : empresas.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">
            Nenhuma empresa vinculada à sua conta. Solicite acesso ao administrador.
          </CardContent></Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {empresas.map((e) => (
              <button key={e.id} onClick={() => go(e)} className="text-left">
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 grid place-items-center">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{e.nome}</div>
                      <div className="text-xs uppercase text-muted-foreground">{e.tipo}</div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}