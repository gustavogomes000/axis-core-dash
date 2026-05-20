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

export const Route = createFileRoute("/_auth/emporio/relatorio")({ component: Page });

function mesIso(d: string) { return d.slice(0, 7); }
function rotuloMes(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function Page() {
  const { empresaAtiva } = useEmpresa();
  const hoje = new Date();
  const [de, setDe] = useState(new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1).toISOString().slice(0, 10));
  const [ate, setAte] = useState(hoje.toISOString().slice(0, 10));

  const { data } = useQuery({
    queryKey: ["rel-emp", empresaAtiva?.id, de, ate],
    enabled: !!empresaAtiva?.id,
    queryFn: async () => {
      const [vendas, itens, parc, cp, mov] = await Promise.all([
        supabase.from("vendas").select("id, total, subtotal, desconto, status, created_at").eq("empresa_id", empresaAtiva!.id),
        supabase.from("itens_venda").select("venda_id, nome_produto, quantidade, total, preco_unitario, produto_id").in("venda_id", []),
        supabase.from("parcelas_receber").select("valor, valor_pago, status, data_vencimento, data_pagamento").eq("empresa_id", empresaAtiva!.id),
        supabase.from("contas_pagar").select("valor, status, data_vencimento, data_pagamento, categoria").eq("empresa_id", empresaAtiva!.id),
        supabase.from("movimentacoes_caixa").select("tipo, valor, categoria, data_movimentacao").eq("empresa_id", empresaAtiva!.id),
      ]);
      const vendaIds = (vendas.data ?? []).map((v: any) => v.id);
      const itensReais = vendaIds.length
        ? await supabase.from("itens_venda").select("venda_id, nome_produto, quantidade, total").in("venda_id", vendaIds)
        : { data: [] as any[] };
      return { vendas: vendas.data ?? [], itens: itensReais.data ?? [], parc: parc.data ?? [], cp: cp.data ?? [], mov: mov.data ?? [], _itensIgnorado: itens };
    },
  });

  const r = useMemo(() => {
    const vendas = data?.vendas ?? []; const itens = data?.itens ?? []; const parc = data?.parc ?? []; const cp = data?.cp ?? []; const mov = data?.mov ?? [];
    const inRange = (d?: string | null) => !!d && d.slice(0, 10) >= de && d.slice(0, 10) <= ate;

    const aprovadas = vendas.filter((v: any) => v.status === "aprovada" && inRange(v.created_at));
    const faturamento = aprovadas.reduce((s, v: any) => s + Number(v.total), 0);
    const descontos = aprovadas.reduce((s, v: any) => s + Number(v.desconto ?? 0), 0);
    const ticket = aprovadas.length ? faturamento / aprovadas.length : 0;
    const recebido = parc.filter((p: any) => p.status === "pago" && inRange(p.data_pagamento)).reduce((s, p: any) => s + Number(p.valor_pago ?? p.valor), 0);
    const aReceber = parc.filter((p: any) => p.status !== "pago").reduce((s, p: any) => s + (Number(p.valor) - Number(p.valor_pago ?? 0)), 0);
    const aPagar = cp.filter((c: any) => c.status === "pendente").reduce((s, c: any) => s + Number(c.valor), 0);
    const pago = cp.filter((c: any) => c.status === "pago" && inRange(c.data_pagamento)).reduce((s, c: any) => s + Number(c.valor), 0);
    const movEnt = mov.filter((m: any) => m.tipo === "entrada" && inRange(m.data_movimentacao)).reduce((s, m: any) => s + Number(m.valor), 0);
    const movSai = mov.filter((m: any) => m.tipo === "saida" && inRange(m.data_movimentacao)).reduce((s, m: any) => s + Number(m.valor), 0);
    const resultado = recebido + movEnt - pago - movSai;

    // top produtos
    const aprovadasIds = new Set(aprovadas.map((v: any) => v.id));
    const prodMap = new Map<string, { nome: string; qtd: number; total: number }>();
    itens.filter((i: any) => aprovadasIds.has(i.venda_id)).forEach((i: any) => {
      const k = i.nome_produto;
      if (!prodMap.has(k)) prodMap.set(k, { nome: k, qtd: 0, total: 0 });
      const p = prodMap.get(k)!;
      p.qtd += Number(i.quantidade); p.total += Number(i.total);
    });
    const topProdutos = Array.from(prodMap.values()).sort((a, b) => b.total - a.total).slice(0, 10);

    // série mensal
    const meses = new Map<string, { mes: string; faturamento: number; recebido: number; pago: number }>();
    const addMes = (ym: string) => { if (!meses.has(ym)) meses.set(ym, { mes: ym, faturamento: 0, recebido: 0, pago: 0 }); return meses.get(ym)!; };
    aprovadas.forEach((v: any) => { const m = addMes(mesIso(v.created_at)); m.faturamento += Number(v.total); });
    parc.forEach((p: any) => { if (p.status === "pago" && inRange(p.data_pagamento)) { const m = addMes(mesIso(p.data_pagamento)); m.recebido += Number(p.valor_pago ?? p.valor); } });
    cp.forEach((c: any) => { if (c.status === "pago" && inRange(c.data_pagamento)) { const m = addMes(mesIso(c.data_pagamento)); m.pago += Number(c.valor); } });
    const serie = Array.from(meses.values()).sort((a, b) => a.mes.localeCompare(b.mes)).map((m) => ({ ...m, label: rotuloMes(m.mes) }));

    return { faturamento, descontos, ticket, qtdVendas: aprovadas.length, recebido, aReceber, aPagar, pago, movEnt, movSai, resultado, topProdutos, serie };
  }, [data, de, ate]);

  const exportarCSVHandler = () => {
    exportarCSV(`relatorio-emporio-${de}_a_${ate}.csv`, r.serie.map((s) => ({ mes: s.label, faturamento: s.faturamento, recebido: s.recebido, pago: s.pago })),
      [{ key: "mes", label: "Mês" }, { key: "faturamento", label: "Faturamento" }, { key: "recebido", label: "Recebido" }, { key: "pago", label: "Pago" }]);
  };

  const imprimirPDF = () => {
    const rowsMes = r.serie.map((s) => `<tr><td>${s.label}</td><td class="r">${formatarMoeda(s.faturamento)}</td><td class="r">${formatarMoeda(s.recebido)}</td><td class="r">${formatarMoeda(s.pago)}</td></tr>`).join("");
    const rowsTop = r.topProdutos.map((p) => `<tr><td>${p.nome}</td><td class="r">${p.qtd}</td><td class="r">${formatarMoeda(p.total)}</td></tr>`).join("");
    imprimirHTML("Relatório Empório", `
      <h1>Relatório Financeiro — Empório</h1>
      <div class="muted">Período: ${formatarData(de)} a ${formatarData(ate)}</div>
      <div class="cards">
        <div class="card"><div class="l">Faturamento</div><div class="v pos">${formatarMoeda(r.faturamento)}</div></div>
        <div class="card"><div class="l">Vendas</div><div class="v">${r.qtdVendas}</div></div>
        <div class="card"><div class="l">Ticket médio</div><div class="v">${formatarMoeda(r.ticket)}</div></div>
        <div class="card"><div class="l">Recebido</div><div class="v pos">${formatarMoeda(r.recebido)}</div></div>
        <div class="card"><div class="l">A receber</div><div class="v">${formatarMoeda(r.aReceber)}</div></div>
        <div class="card"><div class="l">A pagar</div><div class="v neg">${formatarMoeda(r.aPagar)}</div></div>
      </div>
      <h2>DRE simplificado</h2>
      <table>
        <tr><td>(+) Recebimentos de vendas</td><td class="r pos">${formatarMoeda(r.recebido)}</td></tr>
        <tr><td>(+) Outras entradas</td><td class="r pos">${formatarMoeda(r.movEnt)}</td></tr>
        <tr><td>(−) Contas pagas</td><td class="r neg">${formatarMoeda(r.pago)}</td></tr>
        <tr><td>(−) Outras saídas</td><td class="r neg">${formatarMoeda(r.movSai)}</td></tr>
        <tr><th>Resultado de caixa</th><th class="r ${r.resultado >= 0 ? "pos" : "neg"}">${formatarMoeda(r.resultado)}</th></tr>
      </table>
      <h2>Top produtos</h2>
      <table><thead><tr><th>Produto</th><th class="r">Qtd</th><th class="r">Total</th></tr></thead><tbody>${rowsTop || '<tr><td colspan="3">Sem vendas no período</td></tr>'}</tbody></table>
      <h2>Mensal</h2>
      <table><thead><tr><th>Mês</th><th class="r">Faturamento</th><th class="r">Recebido</th><th class="r">Pago</th></tr></thead><tbody>${rowsMes}</tbody></table>
    `);
  };

  return (
    <div>
      <PageHeader title="Relatório financeiro" subtitle="Faturamento, DRE simplificado e top produtos" action={
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
          ["Faturamento", formatarMoeda(r.faturamento)],
          ["Vendas aprovadas", String(r.qtdVendas)],
          ["Ticket médio", formatarMoeda(r.ticket)],
          ["Recebido", formatarMoeda(r.recebido)],
          ["A receber", formatarMoeda(r.aReceber)],
          ["A pagar", formatarMoeda(r.aPagar)],
        ].map(([label, value]) => (
          <Card key={label}><CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
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
              <Bar dataKey="faturamento" name="Faturamento" fill="hsl(var(--primary))" />
              <Bar dataKey="recebido" name="Recebido" fill="hsl(var(--accent))" />
              <Bar dataKey="pago" name="Pago" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent></Card>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-5">
          <div className="font-semibold mb-3">Top produtos</div>
          {r.topProdutos.length === 0 && <div className="text-sm text-muted-foreground">Sem vendas no período.</div>}
          <div className="space-y-2">
            {r.topProdutos.map((p) => (
              <div key={p.nome} className="flex justify-between text-sm border-b pb-1.5">
                <span className="truncate">{p.nome} <span className="text-muted-foreground">×{p.qtd}</span></span>
                <span className="font-medium">{formatarMoeda(p.total)}</span>
              </div>
            ))}
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="font-semibold mb-3">DRE simplificado</div>
          <div className="space-y-1 text-sm">
            <Linha label="(+) Recebimentos de vendas" value={r.recebido} pos />
            <Linha label="(+) Outras entradas" value={r.movEnt} pos />
            <Linha label="(−) Contas pagas" value={r.pago} neg />
            <Linha label="(−) Outras saídas" value={r.movSai} neg />
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Resultado de caixa</span>
              <span className={r.resultado >= 0 ? "text-primary" : "text-destructive"}>{formatarMoeda(r.resultado)}</span>
            </div>
          </div>
        </CardContent></Card>
      </div>
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