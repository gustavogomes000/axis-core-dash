import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { useRole, type Papel } from "@/hooks/useRole";
import { PageHeader } from "@/components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/emporio/usuarios")({ component: Page });

const PAPEIS: { value: Papel; label: string; desc: string }[] = [
  { value: "admin", label: "Dono / Admin", desc: "Acesso total" },
  { value: "gerente", label: "Gerente", desc: "Aprova vendas, libera entregas, vê tudo menos config" },
  { value: "vendedor", label: "Vendedor", desc: "Vende, cadastra cliente, vê suas comissões" },
  { value: "caixa", label: "Caixa", desc: "Recebe pagamentos e movimenta caixa" },
  { value: "estoquista", label: "Estoque/Entrega", desc: "Produtos, estoque e entregas" },
  { value: "visualizador", label: "Somente leitura", desc: "Vê dados sem alterar" },
];

function Page() {
  const qc = useQueryClient();
  const { empresaAtiva } = useEmpresa();
  const role = useRole();
  const empresaId = empresaAtiva?.id;

  const { data: vinculos = [], isLoading } = useQuery({
    queryKey: ["empresa-usuarios", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data } = await supabase.from("usuario_empresa").select("id, usuario_id, papel, ativo, created_at").eq("empresa_id", empresaId!);
      const ids = (data ?? []).map((u) => u.usuario_id);
      if (ids.length === 0) return [];
      const { data: us } = await supabase.from("usuarios").select("id, nome, email, telefone").in("id", ids);
      return (data ?? []).map((v) => ({ ...v, usuario: us?.find((u) => u.id === v.usuario_id) }));
    },
  });

  const trocarPapel = useMutation({
    mutationFn: async ({ id, papel }: { id: string; papel: Papel }) => {
      const { error } = await supabase.from("usuario_empresa").update({ papel } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["empresa-usuarios"] }); toast.success("Papel atualizado"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("usuario_empresa").update({ ativo } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["empresa-usuarios"] }); toast.success("Acesso atualizado"); },
    onError: (e: any) => toast.error(e.message),
  });

  if (!role.gerirUsuarios) {
    return <div className="text-center text-muted-foreground py-12">Você não tem permissão para gerenciar usuários.</div>;
  }

  return (
    <div>
      <PageHeader title="Usuários da loja" subtitle="Defina o que cada pessoa pode fazer no sistema" />

      <div className="rounded-lg border bg-muted/30 p-4 mb-4 text-sm">
        <p className="font-medium mb-1">Como funciona</p>
        <ul className="text-muted-foreground space-y-1 list-disc pl-5">
          {PAPEIS.map((p) => (
            <li key={p.value}><strong>{p.label}:</strong> {p.desc}</li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mt-2">Para convidar uma nova pessoa, peça para ela criar a conta na tela de login. Depois ela aparecerá aqui para você liberar o acesso.</p>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Papel</TableHead><TableHead className="text-center w-24">Ativo</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Carregando…</TableCell></TableRow>}
            {!isLoading && vinculos.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Ninguém vinculado ainda</TableCell></TableRow>}
            {vinculos.map((v: any) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.usuario?.nome ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{v.usuario?.email ?? "—"}</TableCell>
                <TableCell>
                  <Select value={v.papel} onValueChange={(papel) => trocarPapel.mutate({ id: v.id, papel: papel as Papel })}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAPEIS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-center">
                  {v.ativo ? <Switch checked onCheckedChange={() => toggleAtivo.mutate({ id: v.id, ativo: false })} /> : <Switch onCheckedChange={() => toggleAtivo.mutate({ id: v.id, ativo: true })} />}
                  {!v.ativo && <Badge variant="secondary" className="ml-2">Bloqueado</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}