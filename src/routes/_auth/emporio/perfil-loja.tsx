import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Store } from "lucide-react";
import { toast } from "sonner";
import { RoleGate } from "@/components/RoleGate";
import { useRole } from "@/hooks/useRole";

export const Route = createFileRoute("/_auth/emporio/perfil-loja")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  const empresaId = empresaAtiva?.id;
  const role = useRole();
  const canEdit = role.config || role.gerirUsuarios;

  const { data: empresa, isLoading: l1 } = useQuery({
    queryKey: ["empresa-detalhe", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase.from("empresas").select("*").eq("id", empresaId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: cfg, isLoading: l2 } = useQuery({
    queryKey: ["config-emporio-perfil", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("config_emporio").select("*").eq("empresa_id", empresaId!).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    nome: "", cnpj: "", telefone: "", email: "", endereco: "", cidade: "", estado: "", cep: "", logo_url: "",
    whatsapp_padrao: "",
    msg_orcamento: "", msg_aprovacao: "", msg_entrega: "", msg_cobranca: "", msg_aniversario: "",
  });

  useEffect(() => {
    setForm((f) => ({
      ...f,
      nome: empresa?.nome ?? "",
      cnpj: empresa?.cnpj ?? "",
      telefone: empresa?.telefone ?? "",
      email: empresa?.email ?? "",
      endereco: empresa?.endereco ?? "",
      cidade: empresa?.cidade ?? "",
      estado: empresa?.estado ?? "",
      cep: empresa?.cep ?? "",
      logo_url: empresa?.logo_url ?? "",
      whatsapp_padrao: cfg?.whatsapp_padrao ?? "",
      msg_orcamento: cfg?.msg_orcamento ?? "",
      msg_aprovacao: cfg?.msg_aprovacao ?? "",
      msg_entrega: cfg?.msg_entrega ?? "",
      msg_cobranca: cfg?.msg_cobranca ?? "",
      msg_aniversario: cfg?.msg_aniversario ?? "",
    }));
  }, [empresa, cfg]);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!empresaId) throw new Error("Sem empresa");
      const { error: e1 } = await supabase.from("empresas").update({
        nome: form.nome,
        cnpj: form.cnpj || null,
        telefone: form.telefone || null,
        email: form.email || null,
        endereco: form.endereco || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        cep: form.cep || null,
        logo_url: form.logo_url || null,
      }).eq("id", empresaId);
      if (e1) throw e1;
      const payloadCfg = {
        empresa_id: empresaId,
        whatsapp_padrao: form.whatsapp_padrao || null,
        msg_orcamento: form.msg_orcamento || null,
        msg_aprovacao: form.msg_aprovacao || null,
        msg_entrega: form.msg_entrega || null,
        msg_cobranca: form.msg_cobranca || null,
        msg_aniversario: form.msg_aniversario || null,
      };
      if (cfg?.id) {
        const { error } = await supabase.from("config_emporio").update(payloadCfg).eq("id", cfg.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("config_emporio").insert(payloadCfg as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empresa-detalhe"] });
      qc.invalidateQueries({ queryKey: ["config-emporio-perfil"] });
      qc.invalidateQueries({ queryKey: ["config-emporio"] });
      toast.success("Perfil da loja salvo");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
  });

  const isLoading = l1 || l2;

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil da loja" subtitle="Dados da empresa e mensagens padrão" />

      {isLoading && <p className="text-muted-foreground">Carregando…</p>}

      {!isLoading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> Dados da empresa</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Nome da loja</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} disabled={!canEdit} />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} disabled={!canEdit} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} disabled={!canEdit} />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!canEdit} />
              </div>
              <div>
                <Label>Logo (URL)</Label>
                <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} disabled={!canEdit} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <Label>Endereço</Label>
                <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} disabled={!canEdit} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} disabled={!canEdit} />
              </div>
              <div>
                <Label>UF</Label>
                <Input value={form.estado} maxLength={2} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })} disabled={!canEdit} />
              </div>
              <div>
                <Label>CEP</Label>
                <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} disabled={!canEdit} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>WhatsApp e mensagens padrão</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>WhatsApp padrão da loja</Label>
                <Input value={form.whatsapp_padrao} onChange={(e) => setForm({ ...form, whatsapp_padrao: e.target.value })} disabled={!canEdit} placeholder="(11) 99999-9999" />
                <p className="text-xs text-muted-foreground mt-1">Usado no catálogo público e como remetente padrão de mensagens.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Mensagem de orçamento</Label>
                  <Textarea rows={3} value={form.msg_orcamento} onChange={(e) => setForm({ ...form, msg_orcamento: e.target.value })} disabled={!canEdit} placeholder="Olá {nome}, segue seu orçamento nº {numero} no valor de R$ {total}." />
                </div>
                <div>
                  <Label>Mensagem de aprovação</Label>
                  <Textarea rows={3} value={form.msg_aprovacao} onChange={(e) => setForm({ ...form, msg_aprovacao: e.target.value })} disabled={!canEdit} />
                </div>
                <div>
                  <Label>Mensagem de entrega</Label>
                  <Textarea rows={3} value={form.msg_entrega} onChange={(e) => setForm({ ...form, msg_entrega: e.target.value })} disabled={!canEdit} />
                </div>
                <div>
                  <Label>Mensagem de cobrança</Label>
                  <Textarea rows={3} value={form.msg_cobranca} onChange={(e) => setForm({ ...form, msg_cobranca: e.target.value })} disabled={!canEdit} />
                </div>
                <div className="md:col-span-2">
                  <Label>Mensagem de aniversário</Label>
                  <Textarea rows={3} value={form.msg_aniversario} onChange={(e) => setForm({ ...form, msg_aniversario: e.target.value })} disabled={!canEdit} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Variáveis disponíveis: {"{nome}, {numero}, {total}, {data}, {loja}"}.</p>
            </CardContent>
          </Card>

          <RoleGate action="config" fallback={
            <p className="text-sm text-muted-foreground">Somente administradores e gerentes podem alterar o perfil da loja.</p>
          }>
            <div className="flex justify-end">
              <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                <Save className="h-4 w-4 mr-2" /> {salvar.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </RoleGate>
        </>
      )}
    </div>
  );
}