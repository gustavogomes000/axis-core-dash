import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/factoring/configuracoes")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["config-factoring", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("config_factoring").select("*").eq("empresa_id", empresaId!).maybeSingle();
      return data ?? null;
    },
  });

  const [f, setF] = useState({
    whatsapp_padrao: "",
    prefixo_contrato: "FAC",
    taxa_juros_padrao: 5,
    tipo_taxa_padrao: "mensal" as "mensal" | "anual",
    valor_minimo_emprestimo: 500,
    valor_maximo_emprestimo: 50000,
    prazo_minimo_meses: 1,
    prazo_maximo_meses: 60,
    multa_atraso: 2,
    juros_mora_diario: 0.0333,
    dias_carencia: 0,
    msg_aprovacao: "",
    msg_liberacao: "",
    msg_vencimento: "",
    msg_cobranca: "",
    msg_quitacao: "",
    msg_boas_vindas: "",
  });

  useEffect(() => {
    if (data) setF({
      whatsapp_padrao: data.whatsapp_padrao ?? "",
      prefixo_contrato: data.prefixo_contrato ?? "FAC",
      taxa_juros_padrao: Number(data.taxa_juros_padrao ?? 5),
      tipo_taxa_padrao: (data.tipo_taxa_padrao ?? "mensal") as any,
      valor_minimo_emprestimo: Number(data.valor_minimo_emprestimo ?? 500),
      valor_maximo_emprestimo: Number(data.valor_maximo_emprestimo ?? 50000),
      prazo_minimo_meses: data.prazo_minimo_meses ?? 1,
      prazo_maximo_meses: data.prazo_maximo_meses ?? 60,
      multa_atraso: Number(data.multa_atraso ?? 2),
      juros_mora_diario: Number(data.juros_mora_diario ?? 0.0333),
      dias_carencia: data.dias_carencia ?? 0,
      msg_aprovacao: data.msg_aprovacao ?? "",
      msg_liberacao: data.msg_liberacao ?? "",
      msg_vencimento: data.msg_vencimento ?? "",
      msg_cobranca: data.msg_cobranca ?? "",
      msg_quitacao: data.msg_quitacao ?? "",
      msg_boas_vindas: data.msg_boas_vindas ?? "",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...f, empresa_id: empresaId };
      if (data?.id) payload.id = data.id;
      const { error } = await supabase.from("config_factoring").upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["config-factoring"] }); toast.success("Configurações salvas"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Parâmetros operacionais do Factoring" />
      {isLoading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-6 max-w-3xl">
          <Card><CardContent className="p-6 grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>WhatsApp padrão</Label><Input value={f.whatsapp_padrao} onChange={(e) => setF({ ...f, whatsapp_padrao: e.target.value })} placeholder="11999999999" /></div>
            <div className="space-y-2"><Label>Prefixo contrato</Label><Input value={f.prefixo_contrato} onChange={(e) => setF({ ...f, prefixo_contrato: e.target.value })} /></div>
          </CardContent></Card>

          <Card><CardContent className="p-6 space-y-4">
            <div className="text-sm font-semibold">Parâmetros de empréstimo</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taxa de juros padrão (%)</Label>
                <Input type="number" step="0.01" value={f.taxa_juros_padrao} onChange={(e) => setF({ ...f, taxa_juros_padrao: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de taxa</Label>
                <Select value={f.tipo_taxa_padrao} onValueChange={(v) => setF({ ...f, tipo_taxa_padrao: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Valor mínimo (R$)</Label><Input type="number" step="0.01" value={f.valor_minimo_emprestimo} onChange={(e) => setF({ ...f, valor_minimo_emprestimo: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Valor máximo (R$)</Label><Input type="number" step="0.01" value={f.valor_maximo_emprestimo} onChange={(e) => setF({ ...f, valor_maximo_emprestimo: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Prazo mínimo (meses)</Label><Input type="number" value={f.prazo_minimo_meses} onChange={(e) => setF({ ...f, prazo_minimo_meses: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Prazo máximo (meses)</Label><Input type="number" value={f.prazo_maximo_meses} onChange={(e) => setF({ ...f, prazo_maximo_meses: +e.target.value })} /></div>
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-6 space-y-4">
            <div className="text-sm font-semibold">Atraso e cobrança</div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Multa por atraso (%)</Label><Input type="number" step="0.01" value={f.multa_atraso} onChange={(e) => setF({ ...f, multa_atraso: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Juros mora/dia (%)</Label><Input type="number" step="0.001" value={f.juros_mora_diario} onChange={(e) => setF({ ...f, juros_mora_diario: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Dias de carência</Label><Input type="number" value={f.dias_carencia} onChange={(e) => setF({ ...f, dias_carencia: +e.target.value })} /></div>
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-6 space-y-4">
            <div className="text-sm font-semibold">Mensagens automáticas</div>
            <p className="text-xs text-muted-foreground">Variáveis: {"{cliente}"}, {"{valor}"}, {"{contrato}"}, {"{vencimento}"}.</p>
            <div className="space-y-2"><Label>Aprovação</Label><Textarea rows={2} value={f.msg_aprovacao} onChange={(e) => setF({ ...f, msg_aprovacao: e.target.value })} /></div>
            <div className="space-y-2"><Label>Liberação</Label><Textarea rows={2} value={f.msg_liberacao} onChange={(e) => setF({ ...f, msg_liberacao: e.target.value })} /></div>
            <div className="space-y-2"><Label>Vencimento próximo</Label><Textarea rows={2} value={f.msg_vencimento} onChange={(e) => setF({ ...f, msg_vencimento: e.target.value })} /></div>
            <div className="space-y-2"><Label>Cobrança</Label><Textarea rows={2} value={f.msg_cobranca} onChange={(e) => setF({ ...f, msg_cobranca: e.target.value })} /></div>
            <div className="space-y-2"><Label>Quitação</Label><Textarea rows={2} value={f.msg_quitacao} onChange={(e) => setF({ ...f, msg_quitacao: e.target.value })} /></div>
            <div className="space-y-2"><Label>Boas-vindas</Label><Textarea rows={2} value={f.msg_boas_vindas} onChange={(e) => setF({ ...f, msg_boas_vindas: e.target.value })} /></div>
          </CardContent></Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : "Salvar configurações"}</Button>
          </div>
        </form>
      )}
    </div>
  );
}