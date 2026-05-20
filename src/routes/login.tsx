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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand side */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Manual de marca · 2026</p>
          <h1 className="mt-6 font-serif text-6xl leading-[0.95] tracking-tight">
            Grupo<br />
            <span className="text-secondary">SRSM</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm text-sidebar-foreground/70 leading-relaxed">
            Duas marcas, uma origem. Confiança, cuidado artesanal e excelência — operadas em uma única plataforma.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-sidebar-accent/60 backdrop-blur p-5 border border-sidebar-border">
            <img src={logoFactoring} alt="SRS M Factoring" className="h-20 w-full object-contain" />
            <p className="mt-3 text-[10px] uppercase tracking-widest text-secondary">Empresa 01</p>
            <p className="text-sm font-medium">Factoring</p>
          </div>
          <div className="rounded-2xl bg-background p-5 border border-sidebar-border">
            <img src={logoEmporio} alt="Srs. M Empório dos Móveis" className="h-20 w-full object-contain" />
            <p className="mt-3 text-[10px] uppercase tracking-widest text-foreground/60">Empresa 02</p>
            <p className="text-sm font-medium text-foreground">Empório</p>
          </div>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary grid place-items-center text-secondary font-serif text-lg">S</div>
            <span className="font-serif text-xl">Grupo SRSM</span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Acesso restrito</p>
          <h2 className="mt-2 font-serif text-3xl text-foreground">Entrar na plataforma</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sistema corporativo de uso interno. O acesso é concedido apenas pelo administrador.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label>Email corporativo</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@gruposrsm.com.br" />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11" disabled={loading}>
              {loading ? "Aguarde…" : "Entrar"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/esqueci-senha" className="text-muted-foreground hover:text-foreground hover:underline">
                Esqueci a senha
              </Link>
              <span className="text-xs text-muted-foreground">Precisa de acesso? Fale com o admin.</span>
            </div>
          </form>

          <p className="mt-12 text-[11px] text-muted-foreground/70 uppercase tracking-widest">
            © {new Date().getFullYear()} Grupo SRSM
          </p>
        </div>
      </main>
    </div>
  );
}