import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { HelpCircle, Lightbulb, ListChecks, Info } from "lucide-react";

export type PageHelp = {
  /** chave única para lembrar que o usuário já viu (localStorage). Ex.: "help.vendas.v1" */
  storageKey: string;
  /** explicação curta do que esta tela faz, em linguagem simples */
  oQueE: string;
  /** passo a passo de como usar */
  passos: string[];
  /** dicas/avisos opcionais */
  dicas?: string[];
};

export function PageHeader({ title, subtitle, action, help }: { title: string; subtitle?: string; action?: React.ReactNode; help?: PageHelp }) {
  const [open, setOpen] = useState(false);

  // Auto-abre na primeira visita
  useEffect(() => {
    if (!help) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(help.storageKey) !== "1") {
      setOpen(true);
    }
  }, [help]);

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v && help) localStorage.setItem(help.storageKey, "1");
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          {help && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => setOpen(true)}
              aria-label="Ajuda desta tela"
              title="Como usar esta tela"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
      {help && (
        <Sheet open={open} onOpenChange={handleClose}>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> Como usar: {title}
              </SheetTitle>
              <SheetDescription>Um guia rápido em linguagem simples.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6 text-sm">
              <section>
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <Info className="h-4 w-4 text-primary" /> O que é esta tela
                </div>
                <p className="text-muted-foreground leading-relaxed">{help.oQueE}</p>
              </section>
              <section>
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <ListChecks className="h-4 w-4 text-primary" /> Passo a passo
                </div>
                <ol className="list-decimal pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                  {help.passos.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
              </section>
              {help.dicas && help.dicas.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <Lightbulb className="h-4 w-4 text-primary" /> Dicas
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground leading-relaxed">
                    {help.dicas.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </section>
              )}
              <div className="pt-2 text-xs text-muted-foreground">
                Para ver de novo, clique no <HelpCircle className="inline h-3 w-3" /> ao lado do título.
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}