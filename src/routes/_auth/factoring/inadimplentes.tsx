import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData, linkWhatsApp, formatarTelefone } from "@/lib/format";
import { diasAtraso } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_auth/factoring/inadimplentes")({ component: Page });

function Page() {
  const { empresaAtiva } = useEmpresa();
  const { data = [] } = useQuery({
    queryKey: ["inad", empresaAtiva?.id],
    enabled: !!empresaAtiva?.id,
    queryFn: async () => {
      const hoje = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from("parcelas_emprestimo").select("*, emprestimos(numero_contrato, clientes_factoring(nome, telefone))").eq("empresa_id", empresaAtiva!.id).in("status", ["pendente", "atrasado"]).lt("data_vencimento", hoje).order("data_vencimento");
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader title="Inadimplentes" subtitle="Parcelas vencidas e não pagas" />
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Contrato</TableHead><TableHead>Venc.</TableHead><TableHead>Dias atraso</TableHead><TableHead className="text-right">Valor</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {data.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sem inadimplência 🎉</TableCell></TableRow>}
            {data.map((p: any) => {
              const tel = p.emprestimos?.clientes_factoring?.telefone;
              const msg = `Olá ${p.emprestimos?.clientes_factoring?.nome}, sua parcela ${p.numero_parcela}/${p.total_parcelas} venceu em ${formatarData(p.data_vencimento)}.`;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.emprestimos?.clientes_factoring?.nome ?? "—"}</TableCell>
                  <TableCell className="font-mono">{p.emprestimos?.numero_contrato}</TableCell>
                  <TableCell>{formatarData(p.data_vencimento)}</TableCell>
                  <TableCell><Badge variant="destructive">{diasAtraso(p.data_vencimento)}d</Badge></TableCell>
                  <TableCell className="text-right">{formatarMoeda(p.valor)}</TableCell>
                  <TableCell><Badge variant="destructive">{p.status}</Badge></TableCell>
                  <TableCell>{tel && <Button size="sm" variant="outline" asChild><a href={linkWhatsApp(tel, msg)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 mr-1" />{formatarTelefone(tel)}</a></Button>}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}