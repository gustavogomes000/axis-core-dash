import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calcularParcelaPrice, gerarTabelaAmortizacao } from "@/lib/finance";
import { formatarMoeda, formatarData } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_auth/factoring/simulador")({ component: Page });

function Page() {
  const [principal, setPrincipal] = useState(5000);
  const [taxa, setTaxa] = useState(5);
  const [meses, setMeses] = useState(12);
  const [primeiro, setPrimeiro] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));

  const parcela = useMemo(() => calcularParcelaPrice(principal, taxa, meses), [principal, taxa, meses]);
  const total = parcela * meses;
  const tabela = useMemo(() => gerarTabelaAmortizacao(principal, taxa, meses, primeiro), [principal, taxa, meses, primeiro]);

  return (
    <div>
      <PageHeader title="Simulador" subtitle="Tabela Price ao vivo" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-6 space-y-4">
          <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" value={principal} onChange={(e) => setPrincipal(+e.target.value)} /></div>
          <div className="space-y-2"><Label>Taxa mensal (%)</Label><Input type="number" step="0.01" value={taxa} onChange={(e) => setTaxa(+e.target.value)} /></div>
          <div className="space-y-2"><Label>Prazo (meses)</Label><Input type="number" value={meses} onChange={(e) => setMeses(+e.target.value)} /></div>
          <div className="space-y-2"><Label>Primeiro vencimento</Label><Input type="date" value={primeiro} onChange={(e) => setPrimeiro(e.target.value)} /></div>
          <div className="pt-3 border-t space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Parcela</span><strong>{formatarMoeda(parcela)}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total a pagar</span><strong>{formatarMoeda(total)}</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total de juros</span><strong>{formatarMoeda(total - principal)}</strong></div>
          </div>
          <Button asChild className="w-full">
            <Link to="/factoring/emprestimos" search={{ novo: 1, valor: principal, taxa, prazo: meses, venc: primeiro } as any}>
              Efetivar este empréstimo <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent></Card>
        <Card><CardContent className="p-0">
          <div className="max-h-[520px] overflow-auto">
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Juros</TableHead><TableHead className="text-right">Amort.</TableHead><TableHead className="text-right">Parcela</TableHead><TableHead className="text-right">Saldo</TableHead></TableRow></TableHeader>
              <TableBody>
                {tabela.map((p) => (
                  <TableRow key={p.numero}>
                    <TableCell>{p.numero}</TableCell>
                    <TableCell>{formatarData(p.vencimento)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(p.juros)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(p.amortizacao)}</TableCell>
                    <TableCell className="text-right font-medium">{formatarMoeda(p.valor)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatarMoeda(p.saldoApos)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}