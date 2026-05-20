import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logoFactoring from "@/assets/brand/logo-factoring.png";
import logoEmporio from "@/assets/brand/logo-emporio.png";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bem-vindo!");
      nav({ to: "/selecionar-empresa" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] selection:bg-secondary/30">
      <div className="w-full max-w-[1100px] h-[700px] grid lg:grid-cols-2 overflow-hidden lg:rounded-[32px] lg:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] bg-white animate-in fade-in zoom-in duration-700">
        {/* Brand Side - Google/Apple Aesthetic */}
        <aside className="relative hidden lg:flex flex-col justify-between p-16 bg-[#0B1733] overflow-hidden">
          {/* Subtle Gradients */}
          <div className="absolute top-0 right-0 h-full w-full opacity-20 bg-[radial-gradient(circle_at_70%_30%,#F0B429_0%,transparent_50%)]" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-secondary/10 blur-[100px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 opacity-90">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-serif text-[#0B1733] font-bold text-sm">S</div>
              <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/60">Plataforma Unificada</p>
            </div>
            
            <h1 className="mt-12 font-serif text-6xl text-white leading-[1.1] tracking-tight">
              Excelência em<br />
              cada <span className="text-secondary italic">detalhe.</span>
            </h1>
            
            <p className="mt-8 max-w-sm text-base text-white/50 font-light leading-relaxed">
              O ecossistema digital do Grupo SRSM para gestão de operações de Factoring e Varejo de alto padrão.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6">
            <div className="group rounded-3xl bg-white/5 backdrop-blur-md p-6 border border-white/10 hover:bg-white/10 transition-all duration-500 cursor-default">
              <img src={logoFactoring} alt="SRS M Factoring" className="h-10 w-auto brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" />
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-secondary/80">Gestão de Crédito</p>
            </div>
            <div className="group rounded-3xl bg-white/5 backdrop-blur-md p-6 border border-white/10 hover:bg-white/10 transition-all duration-500 cursor-default">
              <img src={logoEmporio} alt="Empório dos Móveis" className="h-10 w-auto brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" />
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-secondary/80">Varejo & Decoração</p>
            </div>
          </div>
        </aside>

        {/* Form Side */}
        <main className="flex flex-col items-center justify-center p-8 lg:p-20 bg-white">
          <div className="w-full max-w-[340px] space-y-10">
            <div className="space-y-3">
              <div className="lg:hidden flex justify-center mb-8">
                <div className="h-14 w-14 rounded-2xl bg-[#0B1733] flex items-center justify-center shadow-xl">
                  <span className="font-serif text-2xl text-secondary">S</span>
                </div>
              </div>
              <h2 className="text-3xl font-serif text-[#0B1733] tracking-tight text-center lg:text-left">Iniciar Sessão</h2>
              <p className="text-sm text-slate-400 font-light text-center lg:text-left leading-relaxed">
                Insira suas credenciais corporativas para acessar o sistema interno.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email</Label>
                  <Input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="nome@gruposrsm.com.br"
                    className="h-14 bg-slate-50 border-none rounded-2xl px-5 transition-all focus:bg-white focus:ring-2 focus:ring-primary/5 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Senha</Label>
                    <Link to="/esqueci-senha" tabIndex={-1} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors">
                      Esqueci
                    </Link>
                  </div>
                  <Input 
                    type="password" 
                    required 
                    minLength={6} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 bg-slate-50 border-none rounded-2xl px-5 transition-all focus:bg-white focus:ring-2 focus:ring-primary/5 text-base"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0B1733] text-white hover:bg-[#0B1733]/90 h-14 rounded-2xl font-semibold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </div>
                ) : "Entrar"}
              </Button>
            </form>

            <footer className="pt-6 border-t border-slate-100">
              <div className="flex flex-col gap-4 text-center items-center">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
                  © {new Date().getFullYear()} Grupo SRSM · Tecnologia
                </p>
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <span className="text-[10px] text-slate-300 font-light">
                  Acesso restrito a colaboradores autorizados
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}