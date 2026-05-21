# Plano de Execução — SRSM / Empório dos Móveis

Vou implementar em **8 sprints sequenciais**. Cada sprint termina com testes (build + lint + unit + manual) antes de seguir para o próximo. Você aprova o plano agora, eu executo sprint a sprint, e ao fim de cada um te mostro o que foi feito + resultado dos testes.

---

## Sprint 1 — Fundações (segurança + auditoria)
**Objetivo:** travar a base antes de tudo.
- Auditoria: rodar build/lint, mapear schema vs código, listar quebras.
- Multi-tenant: remover qualquer fallback fora de `usuario_empresa`.
- RLS: revisar todas as policies, garantir `has_empresa_access` em 100%.
- Criar tabela `audit_log` (quem fez o quê, quando, em qual registro).
- Corrigir encoding pt-BR em telas/seeds.
- Corrigir bug de hidratação SSR no login (data renderizada no servidor).

**Testes:** build ✓, lint ✓, teste unit de permissões, validação manual de troca de empresa.

---

## Sprint 2 — Hierarquia de Papéis Completa
**Objetivo:** 6 perfis funcionando em UI + backend + RLS.
- Expandir enum/matriz para: CEO, gerente, vendedor, estoquista, financeiro, visualizador.
- Atualizar `useRole` + `RoleGate` + sidebar por papel.
- Server functions validando papel (não só UI escondendo botão).
- Limites de desconto por papel (5% / 15% / sem limite).
- Fluxo de aprovação de desconto (tabela `aprovacoes_desconto`).

**Testes:** unit das permissões por papel, E2E manual login com cada perfil.

---

## Sprint 3 — Perfil da Loja + Catálogo Interno
**Objetivo:** identidade da loja + ferramenta de venda assistida.
- `/emporio/perfil-loja` completo (logo, banner, redes, políticas, QR Code).
- `/emporio/vendedor/catalogo` com busca, filtros, compartilhar WhatsApp.
- Util central `gerarLinkWhatsApp()` com templates.

**Testes:** build, validação manual de upload/preview/QR.

---

## Sprint 4 — Dashboard do Vendedor + Comissões
**Objetivo:** vendedor enxerga só o que é dele + comissão automática.
- `/emporio/vendedor/dashboard` com KPIs próprios.
- Tabela `comissoes` (pendente/liberada/paga/cancelada).
- Trigger: venda aprovada → comissão pendente; cancelada → cancela.
- `/emporio/vendedor/comissoes` (vendedor vê própria, gerente vê todas + ranking).

**Testes:** unit cálculo de comissão, E2E manual de uma venda gerando comissão.

---

## Sprint 5 — Nova Venda Ponta a Ponta (5 etapas)
**Objetivo:** o coração operacional.
- Refatorar `/emporio/vendas/nova` em 5 etapas (cliente → produtos → comercial → pagamento → finalização).
- Bloqueio de venda sem estoque + override gerente.
- Aprovação de desconto integrada.
- Geração automática de parcelas + caixa + baixa de estoque.
- Botões: salvar orçamento, confirmar venda, WhatsApp, PDF.

**Testes:** unit cálculos, integração venda→parcelas→caixa→estoque, E2E manual.

---

## Sprint 6 — Orçamentos + WhatsApp Integrado
**Objetivo:** orçamento profissional + templates WhatsApp.
- Orçamento NÃO baixa estoque/financeiro, tem validade.
- Conversão orçamento → venda (revalida estoque).
- Templates WhatsApp: catálogo, produto, orçamento, venda, cobrança, entrega, pós-venda.
- PDF de orçamento e venda.

**Testes:** unit conversão, validação manual de envio WhatsApp.

---

## Sprint 7 — Relatórios Gerenciais + Central de Ajuda
**Objetivo:** visão CEO + onboarding.
- `/emporio/relatorios/comercial` com 15+ indicadores e gráficos (MoM, ranking, funil).
- `/ajuda` com guia por perfil, tutoriais por tela, FAQ, busca.
- Tour guiado no primeiro acesso (por papel).
- Ícones de ajuda contextual nos campos críticos.

**Testes:** validação manual por perfil.

---

## Sprint 8 — Testes Automatizados + Hardening
**Objetivo:** rede de segurança real.
- Unit tests: formatadores, cálculos, permissões, WhatsApp util.
- Integração: criar cliente→orçamento→venda→parcela→pagamento→caixa.
- E2E (Playwright): jornadas de vendedor, gerente, estoquista, financeiro, admin.
- Testes multi-tenant (empresa A não vê B).
- Relatório final completo + atualização do README.

**Testes:** suite completa rodando verde.

---

## Como vamos trabalhar

1. Aprove o plano.
2. Executo **Sprint 1** inteiro.
3. Te mostro resultado + testes.
4. Você aprova ou ajusta → executo **Sprint 2**.
5. E assim por diante.

Cada sprint deve render entre 1-3 ciclos de chat dependendo do tamanho. Se algum sprint ficar grande demais, eu quebro em 1a/1b internamente sem mudar o plano.

## Detalhes técnicos
- Stack mantida: TanStack Start + Supabase + Tailwind.
- Migrations SQL versionadas em `supabase/migrations/`.
- Server functions com `requireSupabaseAuth` + validação Zod.
- Sem mocks em telas finais. Sem service_role no client.
- Bug de hidratação do login será corrigido já no Sprint 1.