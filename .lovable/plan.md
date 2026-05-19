## Grupo SRSM — Sistema de Gestão Multi-Tenant

Banco Supabase já está criado (todas as tabelas, enums, funções e RLS via `has_empresa_access` já existem). Foco do plano: construir o frontend TanStack Start completo + ajustes pontuais de backend (triggers de auto-criação de parcelas, server functions sensíveis).

### Stack e fundação
- TanStack Start + React + Tailwind + shadcn/ui (já instalados)
- Supabase client browser para leituras/escritas com RLS
- `createServerFn` apenas onde precisar de lógica privilegiada (geração de número de contrato via `generate_numero_contrato`, aprovação de empréstimo)
- Sonner para toasts, Recharts para gráficos, React Hook Form + Zod para formulários
- Paleta dourado `#D4A528` / azul `#1E5AA8` aplicada via tokens em `src/styles.css` (oklch)

### Estrutura de rotas (file-based)
```
src/routes/
  __root.tsx                    layout + providers + Sonner
  index.tsx                     redirect → /login ou /selecionar-empresa
  login.tsx
  esqueci-senha.tsx
  reset-password.tsx
  _auth.tsx                     guard de sessão (beforeLoad)
  _auth/selecionar-empresa.tsx
  _auth/emporio/...             (15 rotas — dashboard, produtos, vendas, clientes, financeiro, catálogo, config)
  _auth/factoring/...           (16 rotas — dashboard, empréstimos, simulador, parcelas, clientes, financeiro, config)
  catalogo.$slug.tsx            público
  catalogo.$slug.produto.$id.tsx público
```

### Contextos globais
- `AuthProvider`: sessão Supabase + perfil `usuarios` + listener `onAuthStateChange` que invalida router e query cache
- `EmpresaProvider`: empresa ativa (persistida em localStorage) + papel do usuário + lista de empresas

### Componentes compartilhados
`StatCard`, `DataTable`, `MoneyDisplay`, `StatusBadge`, `SearchInput` (debounce 300ms), `ConfirmDialog`, `EmptyState`, `AppSidebar` (dinâmica por módulo), `AppHeader` (seletor empresa + user menu), `WhatsAppButton`, `CepInput` (auto-fill ViaCEP), `ScoreBar`.

### Utils
`formatarMoeda`, `formatarCPF`, `formatarCNPJ`, `formatarTelefone`, `formatarData`, `formatarDataHora`, `calcularParcelaPrice`, `gerarTabelaAmortizacao`, `calcularMultaMora`, `linkWhatsApp(telefone, mensagem)`.

### Backend complementar (migrations)
- Trigger `fn_gerar_parcelas_receber` em `vendas` quando status muda para `aprovada` e `parcelas > 1`
- Trigger `fn_gerar_parcelas_emprestimo` em `emprestimos` quando status muda para `ativo` (tabela Price)
- Trigger `fn_registrar_movimentacao_caixa` em `parcelas_emprestimo` e `parcelas_receber` quando pagas
- Trigger `fn_set_numero_contrato` usando `generate_numero_contrato` no INSERT de `emprestimos`
- Política de INSERT em `usuario_empresa` e `empresas` (hoje só SELECT) — apenas se admin precisar criar empresas pelo app; senão deixar via SQL Editor
- Seed inicial: 2 empresas (Empório dos Móveis tipo `emporio`, SRS M Factoring tipo `factoring`) + vínculo com primeiro usuário cadastrado

### Plano de entrega (fases)
Por escala (~50 telas), entrega em fases. Cada fase = preview funcional.

**Fase 1 — Fundação (esta entrega)**
- Tokens de design + AppSidebar/AppHeader + Auth + Empresa providers
- Login, esqueci-senha, reset-password, selecionar-empresa
- Layout `_auth` com guard, redirect por tipo de empresa
- Componentes compartilhados + utils
- Migrations dos triggers acima

**Fase 2 — Empório (core)**
- Dashboard Empório (5 stats + 4 gráficos + listas)
- Produtos: lista, formulário, movimentações de estoque
- Clientes Empório: lista, perfil com abas
- Vendas: lista, fluxo 3 etapas, detalhe com parcelas

**Fase 3 — Empório (financeiro + catálogo)**
- Fluxo de caixa, Contas a Pagar, Contas a Receber
- Configurações empório + templates WhatsApp
- Catálogo público + configurações + página de produto público

**Fase 4 — Factoring (core)**
- Dashboard Factoring (6 stats + 4 gráficos + 4 listas)
- Simulador (cálculo Price ao vivo + tabela amortização)
- Clientes Factoring: lista, formulário com referências, score
- Empréstimos: lista, novo (com preview), detalhe com timeline + parcelas

**Fase 5 — Factoring (parcelas + financeiro)**
- Todas parcelas, registrar pagamento, todos devem, inadimplentes
- Contas a pagar factoring, relatório financeiro com export PDF
- Configurações factoring

### Permissões
Helper `usePermissoes()` retorna `{ podeEditar, podeExcluir, podeAprovar, podeAlterarConfig, podeAlterarScore }` baseado em `papel` do `EmpresaContext`. Botões/ações condicionais; RLS no banco é backstop.

### Decisões técnicas chave
- **Cliente Supabase browser** para 95% das operações (RLS via `has_empresa_access` já protege)
- **Server functions** apenas para: aprovar empréstimo (gera parcelas atomicamente), gerar PDF de relatório, upload de arquivos para storage
- **TanStack Query** para cache/invalidação após mutations
- **React Hook Form + Zod** em todos os formulários
- **Storage buckets** a criar: `logos`, `produtos`, `documentos-clientes`, `comprovantes` (todos com policy `has_empresa_access`)

### Confirmações antes de começar
1. Confirma que devo começar pela **Fase 1** e seguir nas próximas mensagens? (não dá pra entregar tudo num turno só sem ficar superficial)
2. As **2 empresas** (Empório dos Móveis + SRS M Factoring) já existem no banco ou devo criar via seed? Confirma seu `auth.uid()` para eu vincular como admin?
3. Pode criar o **storage bucket** para uploads de imagens de produtos/logos?
