import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, Download } from "lucide-react";
import { formatarMoeda, formatarData } from "@/lib/format";
import { exportarCSV, imprimirHTML } from "@/lib/export";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/_auth/factoring/relatorio")({ component: Page });

function mesIso(d: string) { return d.slice(0, 7); }
function rotuloMes(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function Page() {
  const { empresaAtiva } = useEmpresa();
  const hoje = new Date();
  const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1).toISOString().slice(0, 10);
  const fimPadrao = hoje.toISOString().slice(0, 10);
  const [de, setDe] = useState(inicioPadrao);
  const [ate, setAte] = useState(fimPadrao);

  const { data } = useQuery({
    queryKey: ["rel-fac", empresaAtiva?.id, de, ate],
    enabled: !!empresaAtiva?.id,
    queryFn: async () => {
      const [emp, parc, cp, mov] = await Promise.all([
        supabase.from("emprestimos").select("valor_principal, saldo_devedor, total_juros, status, data_liberacao, created_at").eq("empresa_id", empresaAtiva!.id),
        supabase.from("parcelas_emprestimo").select("valor, valor_pago, valor_juros, status, data_vencimento, data_pagamento").eq("empresa_id", empresaAtiva!.id),
        supabase.from("contas_pagar").select("valor, status, data_vencimento, data_pagamento, categoria, descricao").eq("empresa_id", empresaAtiva!.id),
        supabase.from("movimentacoes_caixa").select("tipo, valor, categoria, data_movimentacao, descricao").eq("empresa_id", empresaAtiva!.id),
      ]);
      return { emp: emp.data ?? [], parc: parc.data ?? [], cp: cp.data ?? [], mov: mov.data ?? [] };
    },
  });

  const r = useMemo(() => {
    const emp = data?.emp ?? []; const parc = data?.parc ?? []; const cp = data?.cp ?? []; const mov = data?.mov ?? [];
    const inRange = (d?: string | null) => !!d && d >= de && d <= ate;

    const carteira = emp.filter((e: any) => e.status === "ativo").reduce((s, e: any) => s + Number(e.saldo_devedor), 0);
    const liberado = emp.filter((e: any) => inRange(e.data_liberacao)).reduce((s, e: any) => s + Number(e.valor_principal), 0);
    const recebido = parc.filter((p: any) => p.status === "pago" && inRange(p.data_pagamento)).reduce((s, p: any) => s + Number(p.valor_pago ?? p.valor), 0);
    const jurosGanhos = parc.filter((p: any) => p.status === "pago" && inRange(p.data_pagamento)).reduce((s, p: any) => s + Number(p.valor_juros ?? 0), 0);
    const aReceber = parc.filter((p: any) => p.status !== "pago").reduce((s, p: any) => s + (Number(p.valor) - Number(p.valor_pago ?? 0)), 0);
    const aPagar = cp.filter((c: any) => c.status === "pendente").reduce((s, c: any) => s + Number(c.valor), 0);
    const pago = cp.filter((c: any) => c.status === "pago" && inRange(c.data_pagamento)).reduce((s, c: any) => s + Number(c.valor), 0);
    const movEnt = mov.filter((m: any) => m.tipo === "entrada" && inRange(m.data_movimentacao)).reduce((s, m: any) => s + Number(m.valor), 0);
    const movSai = mov.filter((m: any) => m.tipo === "saida" && inRange(m.data_movimentacao)).reduce((s, m: any) => s + Number(m.valor), 0);
    const resultado = jurosGanhos + movEnt - pago - movSai;

    // série mensal
    const meses = new Map<string, { mes: string; recebido: number; pago: number; juros: number }>();
    const addMes = (ym: string) => { if (!meses.has(ym)) meses.set(ym, { mes: ym, recebido: 0, pago: 0, juros: 0 }); return meses.get(ym)!; };
    parc.forEach((p: any) => { if (p.status === "pago" && inRange(p.data_pagamento)) { const m = addMes(mesIso(p.data_pagamento)); m.recebido += Number(p.valor_pago ?? p.valor); m.juros += Number(p.valor_juros ?? 0); } });
    cp.forEach((c: any) => { if (c.status === "pago" && inRange(c.data_pagamento)) { const m = addMes(mesIso(c.data_pagamento)); m.pago += Number(c.valor); } });
    mov.forEach((mv: any) => { if (inRange(mv.data_movimentacao)) { const m = addMes(mesIso(mv.data_movimentacao)); if (mv.tipo === "entrada") m.recebido += Number(mv.valor); else m.pago += Number(mv.valor); } });
    const serie = Array.from(meses.values()).sort((a, b) => a.mes.localeCompare(b.mes)).map((m) => ({ ...m, label: rotuloMes(m.mes), resultado: m.recebido - m.pago }));

    return { carteira, liberado, recebido, jurosGanhos, aReceber, aPagar, pago, movEnt, movSai, resultado, serie };
  }, [data, de, ate]);

  const exportarCSVHandler = () => {
    exportarCSV(`relatorio-factoring-${de}_a_${ate}.csv`, r.serie.map((s) => ({ mes: s.label, recebido: s.recebido, pago: s.pago, juros: s.juros, resultado: s.resultado })),
      [{ key: "mes", label: "Mês" }, { key: "recebido", label: "Recebido" }, { key: "pago", label: "Pago" }, { key: "juros", label: "Juros ganhos" }, { key: "resultado", label: "Resultado" }]);
  };

  const imprimirPDF = () => {
    const rows = r.serie.map((s) => `<tr><td>${s.label}</td><td class="r">${formatarMoeda(s.recebido)}</td><td class="r">${formatarMoeda(s.pago)}</td><td class="r">${formatarMoeda(s.juros)}</td><td class="r ${s.resultado >= 0 ? "pos" : "neg"}">${formatarMoeda(s.resultado)}</td></tr>`).join("");
    imprimirHTML("Relatório Factoring", `
      <h1>Relatório Financeiro — Factoring</h1>
      <div class="muted">Período: ${formatarData(de)} a ${formatarData(ate)}</div>
      <div class="cards">
        <div class="card"><div class="l">Carteira ativa</div><div class="v">${formatarMoeda(r.carteira)}</div></div>
        <div class="card"><div class="l">Liberado no período</div><div class="v">${formatarMoeda(r.liberado)}</div></div>
        <div class="card"><div class="l">Recebido</div><div class="v pos">${formatarMoeda(r.recebido)}</div></div>
        <div class="card"><div class="l">Juros ganhos</div><div class="v pos">${formatarMoeda(r.jurosGanhos)}</div></div>
        <div class="card"><div class="l">A receber</div><div class="v">${formatarMoeda(r.aReceber)}</div></div>
        <div class="card"><div class="l">A pagar</div><div class="v neg">${formatarMoeda(r.aPagar)}</div></div>
      </div>
      <h2>DRE simplificado</h2>
      <table>
        <tr><td>(+) Juros ganhos</td><td class="r pos">${formatarMoeda(r.jurosGanhos)}</td></tr>
        <tr><td>(+) Outras entradas de caixa</td><td class="r pos">${formatarMoeda(r.movEnt)}</td></tr>
        <tr><td>(−) Contas pagas</td><td class="r neg">${formatarMoeda(r.pago)}</td></tr>
        <tr><td>(−) Outras saídas de caixa</td><td class="r neg">${formatarMoeda(r.movSai)}</td></tr>
        <tr><th>Resultado</th><th class="r ${r.resultado >= 0 ? "pos" : "neg"}">${formatarMoeda(r.resultado)}</th></tr>
      </table>
      <h2>Mensal</h2>
      <table><thead><tr><th>Mês</th><th class="r">Recebido</th><th class="r">Pago</th><th class="r">Juros</th><th class="r">Resultado</th></tr></thead><tbody>${rows}</tbody></table>
    `);
  };

  return (
    <div>
      <PageHeader title="Relatório financeiro" subtitle="DRE simplificado, evolução mensal e exportação" action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarCSVHandler}><Download className="h-4 w-4 mr-2" />CSV</Button>
          <Button onClick={imprimirPDF}><Printer className="h-4 w-4 mr-2" />Imprimir / PDF</Button>
        </div>
      } />
      <Card className="mb-4"><CardContent className="p-4 grid sm:grid-cols-2 gap-3">
        <div className="space-y-1"><Label>De</Label><Input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></div>
        <div className="space-y-1"><Label>Até</Label><Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></div>
      </CardContent></Card>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          ["Carteira ativa", r.carteira],
          ["Liberado no período", r.liberado],
          ["Recebido no período", r.recebido],
          ["Juros ganhos", r.jurosGanhos],
          ["A receber", r.aReceber],
          ["A pagar", r.aPagar],
        ].map(([label, value]) => (
          <Card key={label as string}><CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">{label as string}</div>
            <div className="text-2xl font-bold mt-1">{formatarMoeda(Number(value ?? 0))}</div>
          </CardContent></Card>
        ))}
      </div>
      <Card className="mb-6"><CardContent className="p-5">
        <div className="font-semibold mb-3">Evolução mensal</div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={r.serie}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatarMoeda(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Bar dataKey="recebido" name="Recebido" fill="hsl(var(--primary))" />
              <Bar dataKey="pago" name="Pago" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-5">
        <div className="font-semibold mb-3">DRE simplificado</div>
        <div className="space-y-1 text-sm">
          <Linha label="(+) Juros ganhos" value={r.jurosGanhos} pos />
          <Linha label="(+) Outras entradas de caixa" value={r.movEnt} pos />
          <Linha label="(−) Contas pagas" value={r.pago} neg />
          <Linha label="(−) Outras saídas de caixa" value={r.movSai} neg />
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Resultado</span>
            <span className={r.resultado >= 0 ? "text-primary" : "text-destructive"}>{formatarMoeda(r.resultado)}</span>
          </div>
        </div>
      </CardContent></Card>
    </div>
  );
}

function Linha({ label, value, pos, neg }: { label: string; value: number; pos?: boolean; neg?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={pos ? "text-primary" : neg ? "text-destructive" : ""}>{formatarMoeda(value)}</span>
    </div>
  );
}