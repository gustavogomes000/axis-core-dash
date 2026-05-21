import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRole } from "@/hooks/useRole";
import { Search, ShoppingCart, Package, Users, Wallet, Settings, Trophy, MessageCircle, BookOpen, Truck } from "lucide-react";

export const Route = createFileRoute("/_auth/emporio/ajuda")({ component: Page });

type Item = { q: string; a: string; papeis?: string[]; tags?: string[] };

const FAQ: Item[] = [
  { q: "Como registrar uma nova venda?", a: "Vá em Vendas e orçamentos → Nova venda. Siga as 3 etapas: cliente → produtos → pagamento. Clique em Finalizar venda para baixar estoque e gerar parcelas.", papeis: ["admin","gerente","vendedor"], tags: ["venda"] },
  { q: "Qual a diferença entre orçamento e venda?", a: "Orçamento não baixa estoque, não cria parcelas e não movimenta o caixa. Tem validade. Só vira venda real quando o gerente aprovar — aí o sistema revalida o estoque.", papeis: ["admin","gerente","vendedor"], tags: ["orcamento","venda"] },
  { q: "Por que minha venda foi para aprovação?", a: "O desconto aplicado passou do limite permitido para o seu papel. Configure os limites em Configurações → Limites de desconto por papel.", papeis: ["admin","gerente","vendedor"], tags: ["desconto","aprovacao"] },
  { q: "Como envio um orçamento por WhatsApp?", a: "Na lista de vendas, clique no ícone de WhatsApp ao lado do orçamento. Personalize o template em Perfil da loja → Mensagens padrão.", papeis: ["admin","gerente","vendedor"], tags: ["whatsapp","orcamento"] },
  { q: "Como vendo minha comissão?", a: "Acesse Comissões. Vendedores veem só as próprias vendas do mês; gerentes/admin veem o ranking completo.", papeis: ["admin","gerente","vendedor"], tags: ["comissao"] },
  { q: "Como cadastrar um novo produto?", a: "Produtos → Novo produto. Preencha nome, preço, estoque e marque 'Disponível no catálogo' se quiser que ele apareça no link público.", papeis: ["admin","gerente","estoquista"], tags: ["produto","estoque"] },
  { q: "O que é o catálogo público?", a: "Um link compartilhável (wa.me, redes sociais) que mostra seus produtos ativos para qualquer cliente. Configure em Catálogo público.", papeis: ["admin","gerente"], tags: ["catalogo"] },
  { q: "Como registro o recebimento de uma parcela?", a: "A receber → clique na parcela → Registrar pagamento. O caixa é atualizado automaticamente.", papeis: ["admin","gerente","caixa"], tags: ["financeiro","pagamento"] },
  { q: "Onde acompanho as entregas?", a: "Entregas mostra todas as vendas com status pendente/em rota/entregue. Use os botões para mudar o status conforme o pedido avança.", papeis: ["admin","gerente","operador"], tags: ["entrega"] },
  { q: "Como mudo as mensagens padrão do WhatsApp?", a: "Perfil da loja → seção Mensagens padrão. Use {nome}, {numero}, {total}, {validade}, {empresa} como variáveis.", papeis: ["admin","gerente"], tags: ["whatsapp","config"] },
  { q: "Onde edito os dados da empresa (logo, endereço, CNPJ)?", a: "Perfil da loja. Esses dados aparecem nos recibos, orçamentos e no catálogo público.", papeis: ["admin","gerente"], tags: ["config","empresa"] },
  { q: "Como adicionar/remover usuários?", a: "Usuários → Convidar usuário. Defina o papel (admin, gerente, vendedor, caixa, estoquista, operador, visualizador). Cada papel tem permissões diferentes.", papeis: ["admin"], tags: ["usuario","permissao"] },
  { q: "Por que não consigo aprovar uma venda?", a: "Aprovação requer papel admin ou gerente. Vendedores só conseguem criar e aguardar.", papeis: ["vendedor"], tags: ["aprovacao","permissao"] },
  { q: "Como gero um relatório financeiro?", a: "Relatório → escolha o período → Imprimir/PDF ou exportar CSV.", papeis: ["admin","gerente"], tags: ["relatorio"] },
];

const ATALHOS: { to: string; icon: any; label: string; need?: string }[] = [
  { to: "/emporio/vendas", icon: ShoppingCart, label: "Vendas e orçamentos", need: "venderProdutos" },
  { to: "/emporio/produtos", icon: Package, label: "Produtos", need: "editarProduto" },
  { to: "/emporio/clientes", icon: Users, label: "Clientes" },
  { to: "/emporio/entregas", icon: Truck, label: "Entregas", need: "gerirEntrega" },
  { to: "/emporio/contas-receber", icon: Wallet, label: "A receber", need: "verFinanceiro" },
  { to: "/emporio/comissoes", icon: Trophy, label: "Comissões", need: "verComissaoPropria" },
  { to: "/emporio/catalogo", icon: BookOpen, label: "Catálogo público" },
  { to: "/emporio/vendedor/catalogo", icon: MessageCircle, label: "Catálogo do vendedor", need: "venderProdutos" },
  { to: "/emporio/perfil-loja", icon: Settings, label: "Perfil da loja", need: "config" },
];

function Page() {
  const role = useRole();
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return FAQ.filter((f) => {
      if (f.papeis && role.papel && !f.papeis.includes(role.papel)) return false;
      if (!termo) return true;
      return (
        f.q.toLowerCase().includes(termo) ||
        f.a.toLowerCase().includes(termo) ||
        (f.tags ?? []).some((t) => t.includes(termo))
      );
    });
  }, [q, role.papel]);

  return (
    <div className="space-y-6">
      <PageHeader title="Central de ajuda" subtitle="Tutoriais, perguntas frequentes e atalhos rápidos" />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar (ex.: desconto, whatsapp, comissão)…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="text-sm font-medium mb-2 text-muted-foreground">Atalhos rápidos</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ATALHOS.filter((a) => !a.need || (role as any)[a.need]).map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.to} to={a.to as any} className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-muted/60 transition text-sm">
                <Icon className="h-4 w-4 text-primary" />
                <span>{a.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2 text-muted-foreground flex items-center justify-between">
          <span>Perguntas frequentes</span>
          <Badge variant="secondary">{filtrados.length}</Badge>
        </div>
        <Card>
          <CardContent className="p-2">
            {filtrados.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">Nada encontrado. Tente outras palavras.</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filtrados.map((f, i) => (
                  <AccordionItem key={i} value={`q-${i}`}>
                    <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/40">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Não achou o que procura? Fale com o administrador do sistema ou consulte o gerente da sua loja.
        </CardContent>
      </Card>
    </div>
  );
}
