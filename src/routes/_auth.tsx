import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export const Route = createFileRoute("/_auth")({ component: Layout });

function Layout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);
  if (loading || !user) return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
  return <Outlet />;
}