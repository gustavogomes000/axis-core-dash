import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import logoFactoring from "@/assets/brand/logo-factoring.png";
import logoEmporio from "@/assets/brand/logo-emporio.png";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bem-vindo de volta");
      nav({ to: "/selecionar-empresa" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#0B1733] antialiased selection:bg-[#F0B429]/40">
      {/* Top utility bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 lg:px-10 py-5 text-[11px] tracking-[0.18em] uppercase">
        <div className="flex items-center gap-2 text-[#0B1733]/70">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Sistema operacional
        </div>
        <div className="hidden sm:block text-[#0B1733]/50 font-medium">
          v2.6 · {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>

      <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] xl:grid-cols-[1.15fr_1fr]">
        {/* ───────── Brand panel ───────── */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#0B1733] text-white px-14 xl:px-20 py-16">
          {/* atmospheric layers */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#F0B429]/15 blur-[140px]" />
            <div className="absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full bg-[#1B3B8F]/40 blur-[120px]" />
            <svg className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M48 0H0V48" fill="none" stroke="white" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Wordmark */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] backdrop-blur border border-white/10 font-serif text-[#F0B429] text-lg">S</div>
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.32em] text-white/50">Grupo</p>
              <p className="text-sm font-semibold tracking-[0.08em]">SRSM · Holding</p>
            </div>
          </div>

          {/* Editorial copy */}
          <div className="relative z-10 max-w-[440px]">
            <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-[#F0B429]/90 font-semibold">
              <Sparkles className="h-3 w-3" /> Plataforma unificada
            </p>
            <h1 className="mt-6 font-serif text-[56px] xl:text-[64px] leading-[1.02] tracking-tight">
              Excelência<br />
              em <span className="italic text-[#F0B429]">cada</span><br />
              detalhe.
            </h1>
            <p className="mt-7 text-[15px] leading-relaxed text-white/55 font-light max-w-sm">
              O ecossistema digital para gerir as operações de Factoring e o Varejo de alto padrão do grupo, em um único lugar.
            </p>
          </div>

          {/* Unidades — logos em sua forma natural (cards claros) */}
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Unidades de negócio</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="group rounded-2xl bg-[#F5F1EA] p-5 ring-1 ring-white/5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-20px_rgba(240,180,41,0.25)]">
                <div className="h-12 flex items-center">
                  <img src={logoFactoring} alt="SRSM Factoring" className="max-h-12 w-auto object-contain" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0B1733]/70">Crédito</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F0B429] group-hover:scale-150 transition-transform" />
                </div>
              </div>
              <div className="group rounded-2xl bg-[#F5F1EA] p-5 ring-1 ring-white/5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-20px_rgba(240,180,41,0.25)]">
                <div className="h-12 flex items-center">
                  <img src={logoEmporio} alt="Empório dos Móveis" className="max-h-12 w-auto object-contain" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0B1733]/70">Varejo</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F0B429] group-hover:scale-150 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ───────── Form panel ───────── */}
        <main className="relative flex items-center justify-center px-6 sm:px-10 lg:px-16 py-20 lg:py-12">
          {/* mobile brand strip */}
          <div className="absolute inset-x-0 top-16 flex justify-center lg:hidden">
            <div className="flex items-center gap-3 rounded-full bg-[#0B1733] text-white px-5 py-2.5 shadow-lg">
              <div className="grid h-6 w-6 place-items-center rounded-md bg-white/10 font-serif text-[#F0B429] text-xs">S</div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">Grupo SRSM</span>
            </div>
          </div>

          <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-10 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#0B1733]/40">Área restrita</p>
              <h2 className="font-serif text-[40px] leading-[1.05] tracking-tight">Bem-vindo<br />de volta.</h2>
              <p className="text-sm text-[#0B1733]/55 leading-relaxed max-w-[320px]">
                Acesse com suas credenciais corporativas para continuar.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B1733]/60">Email corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@gruposrsm.com.br"
                  className="h-14 bg-white border border-[#0B1733]/10 rounded-xl px-4 text-[15px] placeholder:text-[#0B1733]/30 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#F0B429]/50 focus-visible:border-[#F0B429]/40"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B1733]/60">Senha</Label>
                  <Link to="/esqueci-senha" tabIndex={-1} className="text-[11px] font-semibold text-[#0B1733]/60 hover:text-[#0B1733] underline-offset-4 hover:underline transition-colors">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 bg-white border border-[#0B1733]/10 rounded-xl px-4 pr-12 text-[15px] placeholder:text-[#0B1733]/30 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#F0B429]/50 focus-visible:border-[#F0B429]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-lg text-[#0B1733]/40 hover:text-[#0B1733] hover:bg-[#0B1733]/5 transition-colors"
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                  className="h-4 w-4 rounded-[5px] border-[#0B1733]/30 data-[state=checked]:bg-[#0B1733] data-[state=checked]:border-[#0B1733]"
                />
                <span className="text-[13px] text-[#0B1733]/70">Manter sessão neste dispositivo</span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="group w-full h-14 rounded-xl bg-[#0B1733] text-white hover:bg-[#0B1733]/95 font-semibold text-[14px] tracking-wide shadow-[0_14px_40px_-12px_rgba(11,23,51,0.45)] transition-all hover:shadow-[0_18px_50px_-12px_rgba(11,23,51,0.6)] active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                    Autenticando…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Entrar na plataforma
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-10 flex items-center gap-3 text-[11px] text-[#0B1733]/45">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Conexão criptografada · acesso somente para colaboradores autorizados</span>
            </div>

            <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-[#0B1733]/35 text-center lg:text-left">
              © {new Date().getFullYear()} Grupo SRSM · Todos os direitos reservados
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
