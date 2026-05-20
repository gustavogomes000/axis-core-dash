import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer } from "lucide-react";
import { formatarMoeda } from "@/lib/format";

export const Route = createFileRoute("/_auth/factoring/relatorio")({ component: Page });

function Page() {
  const { empresaAtiva } = useEmpresa();
  const { data } = useQuery({
    queryKey: ["rel", empresaAtiva?.id],
    enabled: !!empresaAtiva?.id,
    queryFn: async () => {
      const [emp, parc, cp] = await Promise.all([
        supabase.from("emprestimos").select("valor_principal, saldo_devedor, total_juros, status").eq("empresa_id", empresaAtiva!.id),
        supabase.from("parcelas_emprestimo").select("valor, valor_pago, status").eq("empresa_id", empresaAtiva!.id),
        supabase.from("contas_pagar").select("valor, status").eq("empresa_id", empresaAtiva!.id),
      ]);
      const carteira = (emp.data ?? []).filter((e: any) => e.status === "ativo").reduce((s: number, e: any) => s + Number(e.saldo_devedor), 0);
      const emprestado = (emp.data ?? []).reduce((s: number, e: any) => s + Number(e.valor_principal), 0);
      const recebido = (parc.data ?? []).filter((p: any) => p.status === "pago").reduce((s: number, p: any) => s + Number(p.valor_pago ?? 0), 0);
      const aReceber = (parc.data ?? []).filter((p: any) => p.status !== "pago").reduce((s: number, p: any) => s + Number(p.valor), 0);
      const aPagar = (cp.data ?? []).filter((c: any) => c.status === "pendente").reduce((s: number, c: any) => s + Number(c.valor), 0);
      return { carteira, emprestado, recebido, aReceber, aPagar };
    },
  });

  return (
    <div>
      <PageHeader title="Relatório financeiro" action={<Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" />Imprimir</Button>} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          ["Carteira ativa", data?.carteira],
          ["Total emprestado", data?.emprestado],
          ["Total recebido", data?.recebido],
          ["A receber", data?.aReceber],
          ["A pagar", data?.aPagar],
          ["Resultado", (data?.recebido ?? 0) - (data?.aPagar ?? 0)],
        ].map(([label, value]) => (
          <Card key={label as string}><CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">{label as string}</div>
            <div className="text-2xl font-bold mt-1">{formatarMoeda(Number(value ?? 0))}</div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}