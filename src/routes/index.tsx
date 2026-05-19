import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold">
          SRSM
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Grupo SRSM</h1>
        <p className="text-lg text-muted-foreground">
          Sistema de gestão empresarial — Empório dos Móveis e SRS M Factoring.
        </p>
        <p className="text-sm text-muted-foreground">
          Sistema em construção. As próximas etapas implementarão dashboards,
          vendas, empréstimos, clientes e financeiro.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Link
            to="/"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Acessar (em breve)
          </Link>
        </div>
      </div>
    </div>
  );
}
