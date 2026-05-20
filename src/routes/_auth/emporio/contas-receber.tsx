import { createFileRoute } from "@tanstack/react-router";
import { useList } from "@/hooks/useEmpresaData";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData } from "@/lib/format";

export const Route = createFileRoute("/_auth/emporio/contas-receber")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("parcelas_receber", "pr-emp", "*", { column: "data_vencimento" });
  return (
    <div>
      <PageHeader title="Contas a receber" subtitle="Parcelas das vendas" />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Parcela</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && data.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma parcela</TableCell></TableRow>}
            {data.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{p.numero_parcela}/{p.total_parcelas}</TableCell>
                <TableCell>{formatarData(p.data_vencimento)}</TableCell>
                <TableCell><Badge variant={p.status === "pago" ? "default" : p.status === "atrasado" ? "destructive" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(p.valor)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}