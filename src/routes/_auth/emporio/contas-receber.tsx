import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useList } from "@/hooks/useEmpresaData";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2 } from "lucide-react";
import { RegistrarPagamentoDialog } from "@/components/RegistrarPagamentoDialog";

export const Route = createFileRoute("/_auth/emporio/contas-receber")({ component: Page });

function Page() {
  const { data = [], isLoading } = useList<any>("parcelas_receber", "pr-emp", "*", { column: "data_vencimento" });
  const [busca, setBusca] = useState("");
  const [rec, setRec] = useState<any>(null);
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p: any) => String(p.numero_parcela).includes(q) || (p.observacoes ?? "").toLowerCase().includes(q));
  }, [data, busca]);
  const totalPendente = data.filter((p: any) => p.status !== "pago").reduce((s: number, p: any) => s + Number(p.valor), 0);

  return (
    <div>
      <PageHeader title="Contas a receber" subtitle={`Parcelas das vendas · ${formatarMoeda(totalPendente)} em aberto`} />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar parcela..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Parcela</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="w-32" /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && filtradas.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">Nenhuma parcela registrada. Crie uma venda para gerar parcelas.</TableCell></TableRow>}
            {filtradas.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{p.numero_parcela}/{p.total_parcelas}</TableCell>
                <TableCell>{formatarData(p.data_vencimento)}</TableCell>
                <TableCell><Badge variant={p.status === "pago" ? "default" : p.status === "atrasado" ? "destructive" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(p.valor)}</TableCell>
                <TableCell className="text-right">
                  {p.status !== "pago" && (
                    <Button size="sm" onClick={() => setRec(p)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Receber
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <RegistrarPagamentoDialog
        open={!!rec} onOpenChange={(v) => !v && setRec(null)}
        modo="receber" tabela="parcelas_receber"
        registro={rec}
        descricao={rec ? `Parcela ${rec.numero_parcela}/${rec.total_parcelas} — venda` : ""}
        categoriaCaixa="venda_recebimento"
        invalidate={["pr-emp"]}
      />
    </div>
  );
}