import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { LayoutDashboard, Package, Users, ShoppingCart, Wallet, Settings, BookOpen, FileMinus, FilePlus, Calculator, FileText, ListChecks, AlertTriangle, BarChart3, Building2, LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

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

  const items = empresaAtiva?.tipo === "factoring" ? FACTORING : empresaAtiva?.tipo === "emporio" ? EMPORIO : [...EMPORIO, ...FACTORING];

  const go = (to: string) => {
    setOpen(false);
    setTimeout(() => nav({ to }), 50);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar página ou ação… (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
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