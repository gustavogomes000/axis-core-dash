import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { LayoutDashboard, Package, Users, ShoppingCart, Wallet, Settings, BookOpen, FileMinus, FilePlus, Calculator, FileText, ListChecks, AlertTriangle, BarChart3, Building2, LogOut, Search } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Item = { label: string; to: string; icon: any; group: string };

const EMPORIO: Item[] = [
  { label: "Dashboard Empório", to: "/emporio", icon: LayoutDashboard, group: "Empório" },
  { label: "Produtos", to: "/emporio/produtos", icon: Package, group: "Empório" },
  { label: "Clientes (Empório)", to: "/emporio/clientes", icon: Users, group: "Empório" },
  { label: "Vendas", to: "/emporio/vendas", icon: ShoppingCart, group: "Empório" },
  { label: "Fluxo de Caixa", to: "/emporio/fluxo-caixa", icon: Wallet, group: "Empório" },
  { label: "Contas a Pagar (Empório)", to: "/emporio/contas-pagar", icon: FileMinus, group: "Empório" },
  { label: "Contas a Receber", to: "/emporio/contas-receber", icon: FilePlus, group: "Empório" },
  { label: "Catálogo público", to: "/emporio/catalogo", icon: BookOpen, group: "Empório" },
  { label: "Configurações (Empório)", to: "/emporio/configuracoes", icon: Settings, group: "Empório" },
];

const FACTORING: Item[] = [
  { label: "Dashboard Factoring", to: "/factoring", icon: LayoutDashboard, group: "Factoring" },
  { label: "Simulador de empréstimo", to: "/factoring/simulador", icon: Calculator, group: "Factoring" },
  { label: "Clientes (Factoring)", to: "/factoring/clientes", icon: Users, group: "Factoring" },
  { label: "Empréstimos", to: "/factoring/emprestimos", icon: FileText, group: "Factoring" },
  { label: "Parcelas", to: "/factoring/parcelas", icon: ListChecks, group: "Factoring" },
  { label: "Inadimplentes", to: "/factoring/inadimplentes", icon: AlertTriangle, group: "Factoring" },
  { label: "Contas a Pagar (Factoring)", to: "/factoring/contas-pagar", icon: FileMinus, group: "Factoring" },
  { label: "Relatório", to: "/factoring/relatorio", icon: BarChart3, group: "Factoring" },
  { label: "Configurações (Factoring)", to: "/factoring/configuracoes", icon: Settings, group: "Factoring" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const nav = useNavigate();
  const { signOut } = useAuth();
  const { empresaAtiva } = useEmpresa();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const empresaId = empresaAtiva?.id;
  const termo = query.trim();
  const debounced = useDebounced(termo, 200);

  const { data: resultados } = useQuery({
    queryKey: ["cmd-search", empresaId, debounced],
    enabled: !!empresaId && debounced.length >= 2,
    queryFn: async () => {
      const like = `%${debounced}%`;
      const tipo = empresaAtiva?.tipo;
      const out: { label: string; sub: string; to: string }[] = [];
      if (tipo !== "factoring") {
        const [clientes, produtos, vendas] = await Promise.all([
          supabase.from("clientes_emporio").select("id, nome, telefone").eq("empresa_id", empresaId!).ilike("nome", like).limit(5),
          supabase.from("produtos").select("id, nome, sku").eq("empresa_id", empresaId!).or(`nome.ilike.${like},sku.ilike.${like}`).limit(5),
          supabase.from("vendas").select("id, numero_venda, total, clientes_emporio(nome)").eq("empresa_id", empresaId!).ilike("numero_venda::text", like).limit(5),
        ]);
        clientes.data?.forEach((c: any) => out.push({ label: c.nome, sub: `Cliente · ${c.telefone ?? ""}`, to: "/emporio/clientes" }));
        produtos.data?.forEach((p: any) => out.push({ label: p.nome, sub: `Produto · ${p.sku ?? ""}`, to: "/emporio/produtos" }));
        vendas.data?.forEach((v: any) => out.push({ label: `Venda #${v.numero_venda}`, sub: `${v.clientes_emporio?.nome ?? ""}`, to: "/emporio/vendas" }));
      }
      if (tipo !== "emporio") {
        const [clientes, emps] = await Promise.all([
          supabase.from("clientes_factoring").select("id, nome, telefone").eq("empresa_id", empresaId!).ilike("nome", like).limit(5),
          supabase.from("emprestimos").select("id, numero_contrato, saldo_devedor, clientes_factoring(nome)").eq("empresa_id", empresaId!).ilike("numero_contrato", like).limit(5),
        ]);
        clientes.data?.forEach((c: any) => out.push({ label: c.nome, sub: `Cliente · ${c.telefone ?? ""}`, to: "/factoring/clientes" }));
        emps.data?.forEach((e: any) => out.push({ label: e.numero_contrato, sub: `Contrato · ${e.clientes_factoring?.nome ?? ""}`, to: "/factoring/emprestimos" }));
      }
      return out;
    },
  });

  const items = empresaAtiva?.tipo === "factoring" ? FACTORING : empresaAtiva?.tipo === "emporio" ? EMPORIO : [...EMPORIO, ...FACTORING];

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    setTimeout(() => nav({ to }), 50);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput value={query} onValueChange={setQuery} placeholder="Buscar página, cliente, produto, contrato… (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        {resultados && resultados.length > 0 && (
          <>
            <CommandGroup heading="Resultados">
              {resultados.map((r, i) => (
                <CommandItem key={i} onSelect={() => go(r.to)}>
                  <Search className="mr-2 h-4 w-4" />
                  <span>{r.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.sub}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        <CommandGroup heading="Ir para">
          {items.map((it) => (
            <CommandItem key={it.to} onSelect={() => go(it.to)}>
              <it.icon className="mr-2 h-4 w-4" />
              <span>{it.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{it.group}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => go("/selecionar-empresa")}>
            <Building2 className="mr-2 h-4 w-4" /> Trocar de empresa
          </CommandItem>
          <CommandItem onSelect={async () => { setOpen(false); await signOut(); nav({ to: "/login" }); }}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function useDebounced<T>(value: T, ms = 200): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}