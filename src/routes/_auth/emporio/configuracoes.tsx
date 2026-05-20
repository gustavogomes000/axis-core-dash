import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useEmpresa } from "@/providers/EmpresaProvider";

export const Route = createFileRoute("/_auth/emporio/configuracoes")({ component: Page });

function Page() {
  const { empresaAtiva } = useEmpresa();
  return (
    <div>
      <PageHeader title="Configurações" />
      <Card><CardContent className="p-6 space-y-2 text-sm">
        <div><span className="text-muted-foreground">Empresa: </span><strong>{empresaAtiva?.nome}</strong></div>
        <div><span className="text-muted-foreground">ID: </span><span className="font-mono">{empresaAtiva?.id}</span></div>
        <p className="text-muted-foreground pt-2">Edite as configurações da empresa diretamente na tabela <code>config_emporio</code>.</p>
      </CardContent></Card>
    </div>
  );
}