import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_auth/emporio/catalogo")({ component: Page });

function Page() {
  const { empresaAtiva } = useEmpresa();
  const { data } = useQuery({
    queryKey: ["config-catalogo", empresaAtiva?.id],
    enabled: !!empresaAtiva?.id,
    queryFn: async () => {
      const { data } = await supabase.from("config_catalogo").select("*").eq("empresa_id", empresaAtiva!.id).maybeSingle();
      return data;
    },
  });
  const url = data?.slug ? `${window.location.origin}/catalogo/${data.slug}` : null;
  return (
    <div>
      <PageHeader title="Catálogo público" subtitle="Compartilhe o link com seus clientes" />
      <Card>
        <CardContent className="p-6 space-y-3">
          {url ? (
            <>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Link público</div>
                <div className="font-mono text-sm break-all">{url}</div>
              </div>
              <Button asChild><a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-2" />Abrir catálogo</a></Button>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Configure o slug do catálogo no banco para ativar o link público.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}