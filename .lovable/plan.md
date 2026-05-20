## Objetivo

Transformar o módulo **Empório dos Móveis** num sistema completo de gestão de loja de móveis, com perfis de usuário bem definidos (do vendedor ao dono), fluxos ponta-a-ponta (atendimento → venda → entrega → financeiro → relatórios) e UX simples para usuários leigos, mantendo toda a robustez já existente.

Foco desta onda: **apenas Empório**. Factoring fica para depois.

---

## 1. Perfis de usuário (papéis) e o que cada um vê

Hoje existem 4 papéis genéricos (`admin`, `gerente`, `operador`, `visualizador`). Vou especializá-los para uma loja de móveis, mantendo a coluna `papel` atual e refinando as permissões + menus por papel.

| Papel | Quem é | O que faz no sistema |
|---|---|---|
| **Dono / Admin** | Proprietário | Vê TUDO. Configurações, usuários, relatórios financeiros, DRE, metas, comissões. |
| **Gerente de loja** | Encarregado | Aprova vendas/descontos, libera entregas, acompanha estoque, vê relatórios operacionais. NÃO vê configurações nem cadastra usuários. |
| **Vendedor** | Time de vendas | Cria orçamento → venda, cadastra cliente rápido, acompanha SUAS vendas e comissões, envia catálogo/orçamento por WhatsApp. NÃO vê custo do produto, nem fluxo de caixa, nem contas a pagar. |
| **Caixa / Financeiro** | Operador de caixa | Recebe pagamentos, dá baixa em parcelas, registra entradas/saídas, emite recibo. NÃO altera produtos nem aprova vendas. |
| **Estoquista / Entregador** | Logística | Vê pedidos prontos para separar/entregar, marca como “separado” / “entregue”, ajusta estoque. NÃO vê preços de venda nem financeiro. |

Tela inicial (`/emporio`) muda conforme o papel: cada um cai num **painel adequado ao seu trabalho**, não numa tela genérica.

---

## 2. Mudanças de banco (mínimas)

Adicionar ao enum `papel_usuario` (se ainda não existir) os valores: `vendedor`, `caixa`, `estoquista`. Manter `admin`, `gerente`, `operador`, `visualizador` para compatibilidade (operador = caixa por padrão até migração).

Adicionar em `vendas`:
- `vendedor_id uuid` — quem fez a venda (vincula comissão).
- `status_entrega` enum (`pendente`, `separando`, `pronto`, `entregue`) — fluxo logístico paralelo ao status financeiro.
- `comissao_pct numeric default 0` e `comissao_valor numeric default 0`.

Nova tabela `metas_vendedor` (opcional, simples):
- `id, empresa_id, vendedor_id, mes (date), meta_valor numeric, comissao_pct numeric`.

RLS: tudo via `has_empresa_access(empresa_id)` (padrão já existente).

---

## 3. Frontend — telas por papel

### 3.1 Hook `useRole` expandido
Matriz de permissões nova com ações específicas: `ver_custo`, `ver_financeiro`, `aprovar_venda`, `dar_desconto_acima_X`, `editar_produto`, `editar_estoque`, `registrar_pagamento`, `gerir_entrega`, `gerir_usuarios`, `ver_relatorio_dono`, `ver_comissao_propria`, `ver_comissao_todos`.

### 3.2 Menu lateral dinâmico
`AppShell` filtra `items` pelo papel. Renomeio amigável:
- “Contas a Receber” → **“A receber dos clientes”**
- “Contas a Pagar” → **“A pagar (fornecedores)”**
- “Fluxo de Caixa” → **“Entradas e saídas”**
- “Vendas” → **“Vendas e orçamentos”**

### 3.3 Dashboards por papel (`/emporio` decide qual renderizar)
- **Dono**: faturamento do mês, ticket médio, top vendedores, alertas de estoque, DRE rápido, atalho “Relatório completo”.
- **Gerente**: vendas pendentes de aprovação, entregas atrasadas, estoque baixo, vendas do dia.
- **Vendedor**: minhas vendas do mês, minha meta vs realizado, minha comissão, botão grande **“+ Nova venda”** e **“Enviar catálogo”**.
- **Caixa**: parcelas vencendo hoje, recebimentos do dia, botão **“Registrar recebimento”** e **“Entrada/saída de caixa”**.
- **Estoquista**: pedidos para separar, pedidos para entregar hoje, produtos abaixo do mínimo.

### 3.4 Nova tela `/emporio/entregas`
Kanban simples: **Aguardando aprovação | Separando | Pronto para entrega | Entregue**. Cartões com cliente, itens, endereço, botão WhatsApp e “avançar etapa”. Visível para gerente/estoquista/dono.

### 3.5 Nova tela `/emporio/comissoes`
- Vendedor vê só a dele (mês corrente + histórico).
- Dono/gerente vê de todos, com ranking.
- Cálculo: `comissao_pct` da venda × `total` (ou meta + bônus, configurável depois).

### 3.6 Nova tela `/emporio/usuarios` (só dono)
Listar usuários da empresa, mudar papel, ativar/desativar. (Convite por email fica para próxima onda — agora só gerencia quem já tem acesso.)

### 3.7 Venda mais simples para leigo (refino, sem perder nada)
Na tela de venda:
- Vendedor é preenchido automático com o usuário logado.
- Cliente: campo de busca + botão **“+ Novo cliente rápido”** (só nome + telefone).
- Botão **“FINALIZAR R$ XX,XX”** grande, abre modal de pagamento (à vista / parcelado / entrada + parcelas).
- Desconto > X% (configurável, padrão 10%) exige aprovação do gerente — venda fica `pendente_aprovacao` se vendedor aplicar acima.
- Botão **“Enviar orçamento por WhatsApp”** direto do rascunho.

### 3.8 Ajustes finos de UX
- Esconder colunas “custo” e “margem” para vendedor.
- Tooltips em jargões (“Orçamento = ainda não é venda confirmada”).
- Confirmações em linguagem natural (“Tem certeza que quer apagar esta venda? Isso não pode ser desfeito.”).
- `RoleGate` aplicado em todos os botões de ação destrutiva.

---

## 4. Configurações novas (`/emporio/configuracoes`)
- Aba **Vendas**: % máximo de desconto sem aprovação, % de comissão padrão.
- Aba **Usuários** (atalho para `/emporio/usuarios`).
- Aba **Mensagens** (já existe).

---

## 5. Detalhes técnicos

- Migração SQL: estender enum `papel_usuario`, adicionar colunas em `vendas`, criar `metas_vendedor`.
- Refatorar `useRole` para retornar a nova matriz de ações.
- Criar `<RoleSwitch>` para renderizar dashboards diferentes em `/emporio/index.tsx`.
- `AppShell` recebe `items` filtrados via `useRole` antes de montar a sidebar.
- Nova rota `_auth/emporio/entregas.tsx`, `_auth/emporio/comissoes.tsx`, `_auth/emporio/usuarios.tsx`.
- Trigger SQL para preencher `comissao_valor` quando venda for aprovada (a partir de `comissao_pct` ou config padrão).
- Toda query nova usa `has_empresa_access` (RLS já cobre).

---

## 6. O que NÃO entra nesta onda
- Convite de usuário por email (depende de auth flow novo).
- Integração WhatsApp Meta oficial (fica com Onda 7 original).
- Factoring (próxima onda).
- App mobile dedicado para entregador (web responsivo já cobre).

---

## Resultado esperado
Ao final, o dono entra e vê o negócio todo. O vendedor entra e só vê o que precisa para vender. O caixa só recebe. O estoquista só separa e entrega. Cada um com 1-2 botões grandes para a ação principal do dia.

**Posso seguir com a implementação?**