import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { Bell, AlertTriangle, Calendar, Package, FileMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData } from "@/lib/format";

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function NotificationsBell() {
  const { empresaAtiva } = useEmpresa();
  const nav = useNavigate();
  const tipo = empresaAtiva?.tipo;
  const empresaId = empresaAtiva?.id;
  const hoje = new Date().toISOString().slice(0, 10);
  const em7 = addDays(7);

  const { data } = useQuery({
    queryKey: ["notifs", empresaId, tipo],
    enabled: !!empresaId,
    refetchInterval: 60_000,
    queryFn: async () => {
      const out: { type: string; title: string; sub?: string; to: string; icon: any; tone: "danger" | "warn" | "info" }[] = [];

      // Contas a pagar vencidas / próximas
      const cp = await supabase.from("contas_pagar").select("id,descricao,valor,data_vencimento,status").eq("empresa_id", empresaId!).neq("status", "pago").lte("data_vencimento", em7);
      (cp.data ?? []).forEach((c: any) => {
        const atrasada = c.data_vencimento < hoje;
        out.push({
          type: "cp",
          title: c.descricao,
          sub: `${formatarMoeda(c.valor)} · venc. ${formatarData(c.data_vencimento)}`,
          to: `/${tipo}/contas-pagar`,
          icon: FileMinus,
          tone: atrasada ? "danger" : "warn",
        });
      });

      if (tipo === "emporio") {
        const pr = await supabase.from("parcelas_receber").select("id,valor,data_vencimento,status,numero_parcela,total_parcelas").eq("empresa_id", empresaId!).neq("status", "pago").lte("data_vencimento", em7);
        (pr.data ?? []).forEach((p: any) => {
          const atrasada = p.data_vencimento < hoje;
          out.push({
            type: "pr",
            title: `Parcela ${p.numero_parcela}/${p.total_parcelas}`,
            sub: `${formatarMoeda(p.valor)} · venc. ${formatarData(p.data_vencimento)}`,
            to: `/emporio/contas-receber`,
            icon: Calendar,
            tone: atrasada ? "danger" : "warn",
          });
        });
        const pe = await supabase.from("produtos").select("id,nome,estoque,estoque_minimo").eq("empresa_id", empresaId!);
        (pe.data ?? []).filter((p: any) => p.estoque <= p.estoque_minimo).forEach((p: any) => {
          out.push({
            type: "estoque",
            title: `Estoque baixo: ${p.nome}`,
            sub: `${p.estoque} un (mín. ${p.estoque_minimo})`,
            to: `/emporio/produtos`,
            icon: Package,
            tone: "warn",
          });
        });
      }

      if (tipo === "factoring") {
        const pe = await supabase.from("parcelas_emprestimo").select("id,valor,data_vencimento,status,numero_parcela,total_parcelas").eq("empresa_id", empresaId!).neq("status", "pago").lte("data_vencimento", em7);
        (pe.data ?? []).forEach((p: any) => {
          const atrasada = p.data_vencimento < hoje;
          out.push({
            type: "pe",
            title: `Parcela ${p.numero_parcela}/${p.total_parcelas}`,
            sub: `${formatarMoeda(p.valor)} · venc. ${formatarData(p.data_vencimento)}`,
            to: atrasada ? `/factoring/inadimplentes` : `/factoring/parcelas`,
            icon: AlertTriangle,
            tone: atrasada ? "danger" : "warn",
          });
        });
      }

      out.sort((a, b) => (a.tone === b.tone ? 0 : a.tone === "danger" ? -1 : 1));
      return out;
    },
  });

  const total = data?.length ?? 0;
  const danger = (data ?? []).filter((n) => n.tone === "danger").length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {total > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[10px] grid place-items-center text-white ${danger > 0 ? "bg-destructive" : "bg-primary"}`}>
              {total > 99 ? "99+" : total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="font-semibold text-sm">Notificações</div>
          {danger > 0 && <Badge variant="destructive">{danger} urgentes</Badge>}
        </div>
        <div className="max-h-96 overflow-auto">
          {total === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Tudo em dia! Sem pendências nos próximos 7 dias.
            </div>
          )}
          {(data ?? []).map((n, i) => {
            const Icon = n.icon;
            return (
              <button
                key={i}
                onClick={() => nav({ to: n.to })}
                className="w-full text-left px-3 py-2.5 hover:bg-muted/60 border-b last:border-0 flex gap-3 items-start"
              >
                <div className={`h-8 w-8 rounded-md grid place-items-center shrink-0 ${n.tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  {n.sub && <div className="text-xs text-muted-foreground truncate">{n.sub}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}