import { createFileRoute } from "@tanstack/react-router";
import { useList } from "@/hooks/useEmpresaData";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData } from "@/lib/format";

export const Route = createFileRoute("/_auth/emporio/vendas")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("vendas", "vendas", "*", { column: "created_at" });
  return (
    <div>
      <PageHeader title="Vendas" subtitle="Histórico de vendas" />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nº</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Pagto</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sem vendas</TableCell></TableRow>}
            {data.map((v: any) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono">#{v.numero_venda}</TableCell>
                <TableCell>{formatarData(v.created_at)}</TableCell>
                <TableCell><Badge variant={v.status === "aprovada" ? "default" : "secondary"}>{v.status}</Badge></TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(v.total)}</TableCell>
                <TableCell className="text-muted-foreground">{v.tipo_pagamento ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}