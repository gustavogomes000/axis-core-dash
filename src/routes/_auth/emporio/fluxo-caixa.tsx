import { createFileRoute } from "@tanstack/react-router";
import { useList } from "@/hooks/useEmpresaData";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export const Route = createFileRoute("/_auth/emporio/fluxo-caixa")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("movimentacoes_caixa", "fluxo-caixa", "*", { column: "data_movimentacao" });
  const entradas = data.filter((m: any) => m.tipo === "entrada").reduce((s: number, m: any) => s + Number(m.valor), 0);
  const saidas = data.filter((m: any) => m.tipo === "saida").reduce((s: number, m: any) => s + Number(m.valor), 0);
  return (
    <div>
      <PageHeader title="Fluxo de caixa" />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Entradas" value={formatarMoeda(entradas)} icon={ArrowUpCircle} />
        <StatCard label="Saídas" value={formatarMoeda(saidas)} icon={ArrowDownCircle} tone="destructive" />
        <StatCard label="Saldo" value={formatarMoeda(entradas - saidas)} icon={Wallet} tone={entradas - saidas < 0 ? "destructive" : "primary"} />
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem movimentações</TableCell></TableRow>}
            {data.map((m: any) => (
              <TableRow key={m.id}>
                <TableCell>{formatarData(m.data_movimentacao)}</TableCell>
                <TableCell>{m.descricao}</TableCell>
                <TableCell className="text-muted-foreground">{m.categoria}</TableCell>
                <TableCell><Badge variant={m.tipo === "entrada" ? "default" : "destructive"}>{m.tipo}</Badge></TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(m.valor)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}