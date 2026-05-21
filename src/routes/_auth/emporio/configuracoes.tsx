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
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/emporio/configuracoes")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["config-emporio", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("config_emporio").select("*").eq("empresa_id", empresaId!).maybeSingle();
      return data ?? null;
    },
  });

  const [f, setF] = useState({
    whatsapp_padrao: "",
    prefixo_numero_venda: "EMP",
    dias_vencimento_padrao: 30,
    msg_orcamento: "",
    msg_aprovacao: "",
    msg_entrega: "",
    msg_cobranca: "",
    msg_aniversario: "",
  });

  const PAPEIS = ["admin", "gerente", "operador", "vendedor", "caixa", "estoquista", "visualizador"] as const;
  const [limites, setLimites] = useState<Record<string, number>>({
    admin: 100, gerente: 20, operador: 10, vendedor: 5, caixa: 5, estoquista: 0, visualizador: 0,
  });

  useEffect(() => {
    if (data) setF({
      whatsapp_padrao: data.whatsapp_padrao ?? "",
      prefixo_numero_venda: data.prefixo_numero_venda ?? "EMP",
      dias_vencimento_padrao: data.dias_vencimento_padrao ?? 30,
      msg_orcamento: data.msg_orcamento ?? "",
      msg_aprovacao: data.msg_aprovacao ?? "",
      msg_entrega: data.msg_entrega ?? "",
      msg_cobranca: data.msg_cobranca ?? "",
      msg_aniversario: data.msg_aniversario ?? "",
    });
    const lim = (data as any)?.desconto_max_por_papel;
    if (lim && typeof lim === "object") {
      setLimites((prev) => ({ ...prev, ...lim }));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...f, desconto_max_por_papel: limites, empresa_id: empresaId };
      if (data?.id) payload.id = data.id;
      const { error } = await supabase.from("config_emporio").upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["config-emporio"] }); toast.success("Configurações salvas"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Personalize a operação do Empório" help={{
        storageKey: "help.configuracoes.v1",
        oQueE: "Onde você ajusta as regras da loja: comissão padrão, limite de desconto, prazos e as mensagens automáticas que o WhatsApp envia.",
        passos: [
          "Defina a comissão padrão dos vendedores (em %).",
          "Ajuste o desconto máximo que cada vendedor pode dar sem precisar de aprovação.",
          "Personalize as mensagens de orçamento, aprovação, cobrança, entrega e aniversário.",
          "Use as variáveis entre chaves, ex.: {nome}, {total}, {vencimento} — são preenchidas sozinhas.",
          "Clique em 'Salvar' no fim para aplicar.",
        ],
        dicas: [
          "Mudanças aqui valem para toda a loja imediatamente.",
          "Só usuários com papel Admin podem alterar essas configurações.",
        ],
      }} />
      {isLoading ? (
        <div className="text-muted-foreground">Carregando…</div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-6 max-w-3xl">
          <Card><CardContent className="p-6 grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>WhatsApp padrão (com DDD)</Label><Input value={f.whatsapp_padrao} onChange={(e) => setF({ ...f, whatsapp_padrao: e.target.value })} placeholder="11999999999" /></div>
            <div className="space-y-2"><Label>Prefixo nº de venda</Label><Input value={f.prefixo_numero_venda} onChange={(e) => setF({ ...f, prefixo_numero_venda: e.target.value })} /></div>
            <div className="space-y-2"><Label>Dias padrão p/ vencimento</Label><Input type="number" value={f.dias_vencimento_padrao} onChange={(e) => setF({ ...f, dias_vencimento_padrao: +e.target.value })} /></div>
          </CardContent></Card>

          <Card><CardContent className="p-6 space-y-4">
            <div className="text-sm font-semibold">Mensagens automáticas</div>
            <p className="text-xs text-muted-foreground">Use {"{cliente}"}, {"{valor}"}, {"{numero}"} como variáveis.</p>
            <div className="space-y-2"><Label>Orçamento enviado</Label><Textarea rows={2} value={f.msg_orcamento} onChange={(e) => setF({ ...f, msg_orcamento: e.target.value })} /></div>
            <div className="space-y-2"><Label>Venda aprovada</Label><Textarea rows={2} value={f.msg_aprovacao} onChange={(e) => setF({ ...f, msg_aprovacao: e.target.value })} /></div>
            <div className="space-y-2"><Label>Entrega realizada</Label><Textarea rows={2} value={f.msg_entrega} onChange={(e) => setF({ ...f, msg_entrega: e.target.value })} /></div>
            <div className="space-y-2"><Label>Cobrança</Label><Textarea rows={2} value={f.msg_cobranca} onChange={(e) => setF({ ...f, msg_cobranca: e.target.value })} /></div>
            <div className="space-y-2"><Label>Aniversário</Label><Textarea rows={2} value={f.msg_aniversario} onChange={(e) => setF({ ...f, msg_aniversario: e.target.value })} /></div>
          </CardContent></Card>

          <Card><CardContent className="p-6 space-y-4">
            <div className="text-sm font-semibold">Limites de desconto por papel (%)</div>
            <p className="text-xs text-muted-foreground">Vendas com desconto acima do limite do papel são enviadas para aprovação do gerente.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {PAPEIS.map((p) => (
                <div key={p} className="space-y-2">
                  <Label className="capitalize">{p}</Label>
                  <Input type="number" min={0} max={100} step="0.5"
                    value={limites[p] ?? 0}
                    onChange={(e) => setLimites({ ...limites, [p]: Math.max(0, Math.min(100, +e.target.value || 0)) })}
                  />
                </div>
              ))}
            </div>
          </CardContent></Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : "Salvar configurações"}</Button>
          </div>
        </form>
      )}
    </div>
  );
}