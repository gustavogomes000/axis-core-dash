import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatarData, formatarMoeda, linkWhatsApp } from "@/lib/format";
import { ArrowRight, MessageCircle, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/emporio/entregas")({ component: Page });

const ETAPAS = [
  { key: "pendente", label: "Aguardando separação", next: "separando" },
  { key: "separando", label: "Separando", next: "pronto" },
  { key: "pronto", label: "Pronto para entrega", next: "entregue" },
  { key: "entregue", label: "Entregue", next: null },
] as const;

function Page() {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;

  const { data = [] } = useQuery({
    queryKey: ["entregas", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase
        .from("vendas")
        .select("id, numero_venda, total, status, status_entrega, data_entrega, created_at, clientes_emporio(nome, telefone), itens_venda(nome_produto, quantidade)")
        .eq("empresa_id", empresaId!)
        .eq("status", "aprovada")
        .order("data_entrega", { ascending: true, nullsFirst: false });
      return data ?? [];
    },
  });

  const mover = useMutation({
    mutationFn: async ({ id, novo }: { id: string; novo: string }) => {
      const { error } = await supabase.from("vendas").update({ status_entrega: novo } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["entregas"] }); toast.success("Etapa atualizada"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Entregas" subtitle="Acompanhe cada pedido até a porta do cliente" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ETAPAS.map((etapa) => {
          const cards = (data as any[]).filter((v) => (v.status_entrega ?? "pendente") === etapa.key);
          return (
            <Card key={etapa.key} className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" />{etapa.label} <Badge variant="secondary" className="ml-auto">{cards.length}</Badge></CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cards.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum pedido</p>}
                {cards.map((v) => (
                  <div key={v.id} className="rounded-md border bg-card p-3 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">#{v.numero_venda} — {v.clientes_emporio?.nome ?? "Balcão"}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {v.data_entrega ? `Entregar em ${formatarData(v.data_entrega)}` : `Pedido ${formatarData(v.created_at)}`}
                        </div>
                      </div>
                      <span className="text-sm font-medium shrink-0">{formatarMoeda(v.total)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(v.itens_venda ?? []).slice(0, 3).map((i: any) => `${i.quantidade}x ${i.nome_produto}`).join(" • ")}
                      {v.itens_venda?.length > 3 && ` • +${v.itens_venda.length - 3}`}
                    </div>
                    <div className="flex gap-1">
                      {v.clientes_emporio?.telefone && (
                        <Button size="sm" variant="outline" onClick={() => window.open(linkWhatsApp(v.clientes_emporio.telefone, `Olá ${v.clientes_emporio?.nome ?? ""}, sobre seu pedido #${v.numero_venda}…`), "_blank")}>
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {etapa.next && (
                        <Button size="sm" className="flex-1" onClick={() => mover.mutate({ id: v.id, novo: etapa.next! })}>
                          Avançar <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}