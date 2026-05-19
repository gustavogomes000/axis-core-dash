Executar todas as 5 fases do plano anterior em sequência, sem parar entre fases.

### Assumindo defaults (sem mais perguntas):
- **Empresas**: criar via seed SQL as duas (Empório dos Móveis + SRS M Factoring) e vincular o primeiro usuário cadastrado como admin de ambas via trigger no INSERT de `usuarios`
- **Storage buckets**: criar `logos`, `produtos`, `documentos-clientes`, `comprovantes` com RLS por `has_empresa_access`
- **Sem PDF nesta entrega**: relatório financeiro usará window.print() com CSS print-friendly (evita dependência node-only no Worker)

### Fase 1 — Fundação
Tokens design (dourado #D4A528 / azul #1E5AA8 em oklch), AuthProvider, EmpresaProvider, AppSidebar dinâmica por módulo, AppHeader, guard `_auth`, login/esqueci-senha/reset-password/selecionar-empresa, componentes compartilhados (StatCard, DataTable, MoneyDisplay, StatusBadge, SearchInput, ConfirmDialog, EmptyState, WhatsAppButton, CepInput, ScoreBar), utils (formatadores + cálculos Price), migrations (triggers de auto-parcelas + número contrato + movimentação caixa + seed empresas + buckets).

### Fase 2 — Empório core
Dashboard, Produtos (lista/form/movimentações), Clientes Empório (lista/perfil), Vendas (lista/wizard 3 etapas/detalhe).

### Fase 3 — Empório financeiro + catálogo
Fluxo caixa, contas a pagar, contas a receber, configurações, catálogo público + config.

### Fase 4 — Factoring core
Dashboard, simulador Price ao vivo, Clientes Factoring (com referências + score), Empréstimos (lista/novo/detalhe com timeline).

### Fase 5 — Factoring parcelas + financeiro
Todas parcelas, registrar pagamento, todos devem, inadimplentes, contas a pagar, relatório (print), configurações.

### Validação final
- Build limpo (sem erros TS)
- Smoke test manual: login → seleciona empresa → navega por 3-4 telas chave de cada módulo
- Testes unitários Vitest para utils críticos: `calcularParcelaPrice`, `gerarTabelaAmortizacao`, `calcularMultaMora`, formatadores (CPF/CNPJ/moeda/telefone), `linkWhatsApp`

### Escopo NÃO incluído (explícito)
- E2E completo (apenas smoke do build + unit dos utils financeiros — testar 50 telas via browser tool consumiria o turno todo)
- Realtime/notificações WhatsApp reais (apenas links wa.me)
- Upload de PDF gerado server-side
