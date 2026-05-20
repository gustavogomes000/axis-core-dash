## Objetivo
Auditar todas as telas do sistema (Empório + Factoring), corrigir o que está quebrado, melhorar UX para usuários leigos digitalmente e adicionar funcionalidades faltantes.

## Escopo atual identificado

**Públicas:** login, esqueci-senha, reset-password, catalogo/$slug, selecionar-empresa

**Empório (9 telas):** index (dashboard), clientes, produtos, vendas, contas-pagar, contas-receber, fluxo-caixa, catalogo, configuracoes

**Factoring (9 telas):** index (dashboard), clientes, emprestimos, parcelas, inadimplentes, contas-pagar, simulador, relatorio, configuracoes

## Fase 1 — Auditoria funcional (sem código)
Para cada tela, verifico:
1. Carregamento de dados (queries Supabase corretas, RLS)
2. Formulários (validação, mensagens de erro claras, mutações funcionando)
3. Ações (excluir, editar, mudar status) com confirmação
4. Estados vazios / loading / erro tratados
5. Responsividade
6. Acessibilidade básica (labels, aria, tap targets)

Entrega: relatório com lista de bugs encontrados e melhorias propostas, agrupados por severidade.

## Fase 2 — Correções (bugs)
Corrijo o que está quebrado antes de adicionar coisa nova.

## Fase 3 — UX para leigos (melhorias transversais)
- **Onboarding contextual:** tooltips e textos explicativos em cada tela ("o que é isso?", "como usar")
- **Tela inicial guiada:** dashboard com cards de ações principais ("Cadastrar cliente", "Nova venda", "Receber pagamento") em linguagem simples
- **Confirmações claras:** todo botão destrutivo (excluir, cancelar) com dialog explicando consequência
- **Mensagens em português coloquial:** trocar jargão ("inadimplente" → "cliente em atraso", "factoring" → manter mas explicar)
- **Wizard de cadastro:** quebrar formulários longos (cliente factoring, empréstimo) em passos
- **Buscas inteligentes:** campo único que busca por nome/CPF/telefone em vez de filtros complexos
- **Feedback visual:** toasts claros em toda ação (salvou, deletou, erro)
- **Empty states didáticos:** quando lista vazia, mostrar ilustração + botão grande "Comece cadastrando seu primeiro cliente"
- **Botão flutuante de ajuda** em cada tela com FAQ contextual

## Fase 4 — Novas funcionalidades sugeridas
- **Dashboard executivo unificado** na home do _auth (visão das duas empresas se o usuário tiver acesso)
- **Notificações in-app** (sino no header): parcelas vencendo hoje/amanhã, estoque baixo, contas a pagar
- **Atalhos globais:** botão "+" flutuante para criar rapidamente (cliente, venda, empréstimo)
- **Importação CSV** de clientes/produtos
- **Exportação PDF** de relatórios e recibos
- **Histórico/timeline** por cliente (todas operações)
- **Modo "guia"** opcional: tour interativo na primeira vez
- **Recibo WhatsApp** com 1 clique após receber parcela
- **Calculadora de juros** no simulador com gráfico visual da evolução da dívida
- **Alertas por WhatsApp** automáticos (já tem tabela `notificacoes_log` — falta integrar disparo)

## Como vou executar
Dada a dimensão (18+ telas), proponho fazer em ondas iterativas, NÃO tudo em um único turno:

**Onda 1 (este turno):** Auditoria completa + correções de bugs críticos + melhorias transversais (toasts, confirmações, empty states, linguagem)

**Onda 2:** Dashboard executivo + notificações + atalhos globais

**Onda 3:** Wizards de cadastro + tour interativo + importação CSV

**Onda 4:** Exportação PDF + recibo WhatsApp + integração de notificações

## Pergunta antes de começar
Confirma essa abordagem em ondas? E quer que eu priorize alguma área (Empório vs Factoring) ou trato as duas em paralelo?
