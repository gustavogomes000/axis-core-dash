import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (loading) return;
    nav({ to: user ? "/selecionar-empresa" : "/login" });
  }, [user, loading, nav]);
  return (
    <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>
  );
}
