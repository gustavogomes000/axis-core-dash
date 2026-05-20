import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowUpRight } from "lucide-react";
import logoFactoring from "@/assets/brand/logo-factoring.png";
import logoEmporio from "@/assets/brand/logo-emporio.png";

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
    <div className="min-h-screen p-6 lg:p-12 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Manual de marca · 2026</p>
            <h1 className="mt-2 font-serif text-4xl text-foreground">Grupo SRSM</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>

        <p className="text-sm text-muted-foreground max-w-xl mb-8">
          Olá <span className="text-foreground font-medium">{user?.email}</span>. Selecione a empresa para começar.
        </p>

        {loading ? (
          <p className="text-muted-foreground">Carregando empresas…</p>
        ) : empresas.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">
            Nenhuma empresa vinculada à sua conta. Solicite acesso ao administrador.
          </CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {empresas.map((e) => {
              const isFactoring = e.tipo === "factoring";
              const logo = isFactoring ? logoFactoring : logoEmporio;
              return (
                <button key={e.id} onClick={() => go(e)} className="text-left group">
                  <div className={`relative overflow-hidden rounded-3xl border transition-all group-hover:-translate-y-1 group-hover:shadow-2xl ${isFactoring ? "bg-sidebar text-sidebar-foreground border-sidebar-border" : "bg-card border-border"}`}>
                    <div className="absolute top-6 right-6">
                      <ArrowUpRight className={`h-5 w-5 ${isFactoring ? "text-secondary" : "text-foreground/50"}`} />
                    </div>
                    <div className="p-8">
                      <p className={`text-[10px] uppercase tracking-[0.3em] ${isFactoring ? "text-secondary" : "text-foreground/50"}`}>
                        Empresa {isFactoring ? "01" : "02"}
                      </p>
                      <div className="h-48 my-6 grid place-items-center">
                        <img src={logo} alt={e.nome} className="max-h-48 max-w-full object-contain" />
                      </div>
                      <h3 className="font-serif text-2xl">{e.nome}</h3>
                      <p className={`mt-2 text-sm ${isFactoring ? "text-sidebar-foreground/70" : "text-muted-foreground"}`}>
                        {isFactoring
                          ? "Soluções financeiras — fomento mercantil, antecipação de recebíveis e crédito empresarial."
                          : "Curadoria de móveis com história — peças que carregam tradição, artesania e sofisticação."}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}