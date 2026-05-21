import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useList } from "@/hooks/useEmpresaData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarData, linkWhatsApp } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, MessageCircle } from "lucide-react";
import { RegistrarPagamentoDialog } from "@/components/RegistrarPagamentoDialog";

export const Route = createFileRoute("/_auth/emporio/contas-receber")({ component: Page });

function Page() {
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  const { data = [], isLoading } = useList<any>("parcelas_receber", "pr-emp", "*, clientes_emporio(nome, telefone)", { column: "data_vencimento" });
  const { data: config } = useQuery({
    queryKey: ["config_emporio", empresaId],
    enabled: !!empresaId,
    queryFn: async () => (await supabase.from("config_emporio").select("msg_cobranca").eq("empresa_id", empresaId!).maybeSingle()).data,
  });
  const [busca, setBusca] = useState("");
  const [rec, setRec] = useState<any>(null);
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p: any) => String(p.numero_parcela).includes(q) || (p.observacoes ?? "").toLowerCase().includes(q) || (p.clientes_emporio?.nome ?? "").toLowerCase().includes(q));
  }, [data, busca]);
  const totalPendente = data.filter((p: any) => p.status !== "pago").reduce((s: number, p: any) => s + Number(p.valor), 0);

  const cobrar = (p: any) => {
    const tel = p.clientes_emporio?.telefone;
    if (!tel) { return; }
    const template = config?.msg_cobranca ?? "Olá {cliente}, lembrete: parcela {numero}/{total} no valor de {valor} vence em {vencimento}.";
    const msg = template
      .replace("{cliente}", p.clientes_emporio?.nome ?? "")
      .replace("{numero}", String(p.numero_parcela))
      .replace("{total}", String(p.total_parcelas))
      .replace("{valor}", formatarMoeda(p.valor))
      .replace("{vencimento}", formatarData(p.data_vencimento));
    window.open(linkWhatsApp(tel, msg), "_blank");
  };

  return (
    <div>
      <PageHeader title="Contas a receber" subtitle={`Parcelas das vendas · ${formatarMoeda(totalPendente)} em aberto`} help={{
        storageKey: "help.contas-receber.v1",
        oQueE: "Todas as parcelas que clientes têm para pagar. Aqui você marca como recebido e cobra quem está atrasado.",
        passos: [
          "Veja as parcelas pendentes na lista — as vencidas aparecem em destaque.",
          "Quando o cliente pagar, clique em 'Registrar pagamento'.",
          "Escolha a forma de pagamento e confirme — o caixa é atualizado sozinho.",
          "Use o WhatsApp para cobrar quem está atrasado com a mensagem padrão.",
        ],
        dicas: [
          "Multa e juros de atraso são calculados automaticamente conforme as Configurações.",
          "Filtre por cliente para ver o que ele deve no total.",
        ],
      }} />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar parcela..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Parcela</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="w-56" /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && filtradas.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">Nenhuma parcela registrada. Crie uma venda para gerar parcelas.</TableCell></TableRow>}
            {filtradas.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{p.clientes_emporio?.nome ?? "—"}</TableCell>
                <TableCell>{p.numero_parcela}/{p.total_parcelas}</TableCell>
                <TableCell>{formatarData(p.data_vencimento)}</TableCell>
                <TableCell><Badge variant={p.status === "pago" ? "default" : p.status === "atrasado" ? "destructive" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(p.valor)}</TableCell>
                <TableCell className="text-right">
                  {p.status !== "pago" && (
                    <div className="flex justify-end gap-1">
                      {p.clientes_emporio?.telefone && (
                        <Button size="sm" variant="outline" onClick={() => cobrar(p)} title="Cobrar via WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" onClick={() => setRec(p)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Receber
                      </Button>
                    </div>
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