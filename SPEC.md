# Spec — Plataforma Digital Clube Atlético Tubarão Saf

> **Nota sobre o Idioma:** Este documento está escrito em Português (pt-BR) para garantir o alinhamento perfeito com os stakeholders do clube. O restante da base de código (código, logs, commits, PRs, arquitetura) deve ser estritamente em Inglês.

**Versão:** 0.1 — Draft  
**Status:** Aguardando aprovação para implementação  
**Contexto legal:** Clube opera em estrutura híbrida SAF + Associação. Passivo em renegociação via RCE (Lei 14.193/2021). Toda decisão de produto deve respeitar a necessidade de disciplina de caixa e transparência como ativo estratégico.

---

## 1. Visão Geral e Objetivo do Produto

### Problema central

O Clube Atlético Tubarão Saf possui passivo herdado, credibilidade deteriorada com empresariado local e base de torcedores sem canal de engajamento ou contribuição financeira recorrente. A ausência de uma estrutura digital impede a geração de receita previsível, a atração de parceiros e a demonstração de governança que o RCE exige.

### Objetivo do produto

Construir uma plataforma digital que:

1. **Monetize a base de torcedores** de forma recorrente e escalável (sócio-torcedor).
2. **Institua transparência radical** como diferencial de credibilidade perante credores, parceiros e imprensa.
3. **Profissionalize a gestão de parceiros/permutas** com rastreabilidade de contrapartidas.
4. **Crie canais de receita complementares** (loja, ingressos digitais) sem overhead operacional desproporcionado.

### Princípio-guia (Unionistas de Salamanca)

> Nunca gastar mais do que se arrecada. Cada módulo deve ser avaliável pela receita gerada ou custo evitado antes de ser construído.

---

## 2. Personas

### 2.1 Sócio-Torcedor (`member`)

- Torcedor da cidade ou região com vínculo emocional ao clube.
- Motivado por pertencimento, não por desempenho esportivo.
- Pode ser pessoa física (maioria) ou pessoa jurídica (plano corporativo).
- Espera transparência sobre para onde vai o dinheiro.
- Tem baixa tolerância a promessas não cumpridas — muitos já foram lesados antes.

### 2.2 Administrador do Clube (`admin`)

- Equipe interna (1–3 pessoas no MVP).
- Precisa de painel para gerenciar sócios, publicar conteúdo de transparência, acompanhar inadimplência, registrar parceiros e emitir provas de entrega.
- Não necessariamente técnico — interface deve ser operável sem treinamento extenso.

### 2.3 Parceiro Comercial / Permutante (`partner`)

- Empresa local (comércio, indústria, serviços) ou instituição de ensino.
- Quer visibilidade mensurável em troca de produto/serviço (permuta) ou dinheiro (patrocínio).
- Precisa de prova de que a contrapartida foi entregue para justificar internamente a renovação.
- Historicamente desconfia do clube — prova de entrega é o ponto de virada.

### 2.4 Visitante do Portal de Transparência (`visitor`)

- Credor, jornalista, torcedor cético, potencial investidor.
- Acessa sem cadastro.
- Quer dados objetivos: balanço, status das dívidas, atas, composição societária.
- Não tem paciência para PDFs enterrados — precisa de informação acessível e datada.

---

## 3. Módulos

---

### Módulo 1 — Sócio-Torcedor (Prioridade #1)

#### 3.1.1 Requisitos Funcionais

**Cadastro e perfil**

- RF-S01: Cadastro via e-mail + senha, ou OAuth (Google).
- RF-S02: Campos obrigatórios: nome completo, CPF, e-mail, telefone, data de nascimento.
- RF-S03: Campos opcionais: endereço (para envio de welcome kit físico), empresa (para plano corporativo).
- RF-S04: Validação de CPF único por cadastro — impede duplicatas e fraude em votações.
- RF-S05: Perfil editável pelo próprio sócio (exceto CPF após validação).

**Planos e tiers**

- RF-S06: Sistema de planos configurável pelo admin (nome, preço, intervalo, benefícios listados).
- RF-S07: Intervalos suportados: mensal e anual (anual com desconto configurável).
- RF-S08: Tier corporativo: CNPJ + razão social, até N carteirinhas nominais vinculadas ao mesmo contrato.
- RF-S09: Troca de plano pelo sócio: upgrade imediato com cobrança proporcional; downgrade na próxima renovação.
- RF-S10: Plano gratuito/simbólico ("sócio solidário") sem benefícios de acesso — para quem quer apoiar mas não pode pagar. Entra no contador público mas não no contador de cotas com acesso a jogo.

**Cobrança recorrente**

- RF-S11: Suporte a cartão de crédito recorrente e Pix automático (via gateway externo — ver seção 5).
- RF-S12: Webhook do gateway atualiza status de adimplência em tempo real.
- RF-S13: Inadimplência: sócio recebe notificações (e-mail + WhatsApp) em D+1, D+7, D+15. Em D+30 o status muda para `suspended` e benefícios são suspensos.
- RF-S14: Reativação automática ao processar pagamento em atraso — sem ação manual do admin.
- RF-S15: Histórico de pagamentos visível ao sócio no painel.

**Carteirinha digital**

- RF-S16: Carteirinha digital gerada automaticamente ao ativar o plano.
- RF-S17: Conteúdo da carteirinha: foto do sócio (upload opcional), nome, número de matrícula, tier, QR code único e assinado, data de validade (mês de expiração do plano atual).
- RF-S18: QR code encode: JWT assinado com `{ memberId, planId, validUntil, status }` — verificável offline pelo validador do matchday.
- RF-S19: Status visual na carteirinha: `ativo` (verde), `suspenso` (cinza), `pendente` (amarelo).
- RF-S20: Carteirinha não é emitida para status `suspended` — QR antigo expira junto com o período pago.

**Gamificação**

- RF-S21: Sistema de pontos (nome configurável pelo clube — ex.: "Escudos").
- RF-S22: Eventos que geram pontos:
  - Check-in em jogo (via validação do QR no matchday): pontuação configurável por evento.
  - Indicação de novo sócio que paga o primeiro mês: pontuação fixa configurável.
  - Aniversário de sócio (data de cadastro): bônus anual.
  - Streak de adimplência: bônus a cada 6 e 12 meses consecutivos sem inadimplência.
- RF-S23: Ranking público de sócios mais engajados (opt-in — sócio escolhe aparecer ou não).
- RF-S24: Pontos são informativos no MVP — resgate por benefícios é fase 2.

**Direito de voto**

- RF-S25: Direito de voto em enquetes e assembleias digitais liberado após 12 meses contínuos de adimplência (regra do Unionistas de Salamanca, adaptada).
- RF-S26: Contagem de tempo de adimplência é reiniciada a cada inadimplência — não acumula períodos intercalados.
- RF-S27: Status de elegibilidade para voto visível no perfil do sócio.
- RF-S28: Enquetes criadas pelo admin com prazo, opções e quórum mínimo. Resultado publicado automaticamente ao encerrar.

**Metas públicas**

- RF-S29: Dashboard público (sem login) exibindo: total de sócios ativos por tier, % da meta atual (configurável pelo admin), frases de impacto configuráveis (ex.: "Com 500 sócios, pagamos os salários da categoria sub-17").
- RF-S30: Contador em tempo real atualizado via webhook de pagamento.

**Monumento / reconhecimento**

- RF-S31: Campo de "exibição no monumento" no perfil — sócio opta por ter o nome incluído na lista exportável para gravação física.
- RF-S32: Admin exporta lista filtrada (apenas ativos que optaram) em CSV/PDF.

#### 3.1.2 Regras de Negócio

| Código | Regra                                                                                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-S01 | CPF é o identificador único de pessoa física. Mesmo e-mail não pode ser usado com dois CPFs distintos.                                                     |
| RN-S02 | Um sócio pode ter apenas um plano ativo por vez.                                                                                                           |
| RN-S03 | Status de adimplência: `active` → `pending` (pagamento não processado no vencimento) → `suspended` (D+30 sem pagamento) → `active` (pagamento processado). |
| RN-S04 | Cancelamento pelo sócio: acesso mantido até o fim do período pago; sem reembolso de período parcial.                                                       |
| RN-S05 | Plano corporativo: cancelamento cancela todas as carteirinhas vinculadas simultaneamente.                                                                  |
| RN-S06 | Indicação: pontos só são creditados quando o indicado completa o primeiro pagamento — não no cadastro.                                                     |
| RN-S07 | Direito de voto: calculado com base em `adimplencia_continua_meses >= 12`, recalculado a cada evento de pagamento/inadimplência.                           |
| RN-S08 | QR code da carteirinha é regeado a cada renovação de plano e a cada reativação pós-suspensão.                                                              |

#### 3.1.3 Fluxos Críticos

**Fluxo: Novo sócio (PF)**

```
Cadastro → Escolha de plano → Dados de pagamento (cartão/Pix) →
Gateway processa → Webhook confirma pagamento →
Status: active | Carteirinha gerada | E-mail de boas-vindas enviado
```

**Fluxo: Inadimplência**

```
Vencimento sem pagamento →
D+1: Notificação e-mail + WhatsApp →
D+7: Segunda notificação →
D+15: Terceira notificação ("último aviso") →
D+30: Status: suspended | Carteirinha invalidada | Acesso bloqueado →
Sócio paga → Webhook → Status: active | Nova carteirinha gerada
```

**Fluxo: Validação no matchday**

```
Porteiro abre validador (PWA ou app admin) →
Lê QR do sócio →
Verifica assinatura do JWT localmente (offline-capable) →
Confirma: nome, tier, status, validade →
Registra check-in → +pontos de gamificação
```

---

### Módulo 2 — Portal de Transparência (Prioridade #2)

#### 3.2.1 Requisitos Funcionais

**Publicações**

- RF-T01: Admin cria publicações categorizadas: `balanco_mensal`, `status_dividas`, `ata_assembleia`, `composicao_societaria`, `documento_saf`, `outro`.
- RF-T02: Cada publicação contém: título, categoria, mês/ano de referência, corpo em texto rico (markdown) e/ou anexo PDF, data de publicação.
- RF-T03: Publicações agendáveis: admin define data/hora de publicação futura.
- RF-T04: Publicações são imutáveis após publicação — edição cria nova versão com histórico (versão anterior permanece acessível e marcada como "substituída").
- RF-T05: RSS feed público por categoria — permite que credores ou imprensa acompanhem atualizações sem acessar o site.

**Dashboard de dívidas**

- RF-T06: Painel com cartões por credor (ou grupo de credores): valor original, valor atual (pós-negociação), valor já pago, saldo restante, status (`em_dia`, `em_negociacao`, `atrasado`, `quitado`).
- RF-T07: Admin atualiza os valores manualmente mensalmente — não há integração automática com sistemas jurídicos no MVP.
- RF-T08: Gráfico de evolução do passivo total ao longo do tempo (linha do tempo desde o início do RCE).
- RF-T09: Campo de "observação pública" por credor — para notas como "acordo homologado em XX/XXXX" ou "execução suspensa até XX/XXXX".

**Documentos**

- RF-T10: Repositório de documentos com busca por título e filtro por categoria e ano.
- RF-T11: Documentos são PDFs ou imagens — upload com tamanho máximo configurável (padrão: 20 MB).
- RF-T12: URL permanente por documento (não muda se o arquivo for substituído por versão nova — a nova versão cria nova URL e a antiga permanece).

**Acesso**

- RF-T13: Portal de transparência é 100% público — sem necessidade de login para qualquer conteúdo.
- RF-T14: Admin tem área restrita de gerenciamento (mesmas credenciais do painel geral).

#### 3.2.2 Regras de Negócio

| Código | Regra                                                                                                                                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-T01 | Publicação não pode ser deletada — apenas arquivada (visível com marcação "arquivado" ou substituída por versão nova). Garante rastro para auditoria. |
| RN-T02 | Mês de referência é obrigatório para categorias `balanco_mensal` e `status_dividas`.                                                                  |
| RN-T03 | Deve haver exatamente uma publicação `balanco_mensal` por mês de referência — sistema alerta admin em caso de duplicata.                              |
| RN-T04 | Gráfico de evolução do passivo é calculado com base no campo `saldo_restante` de todos os credores na data de cada atualização (snapshots).           |

#### 3.2.3 Fluxos Críticos

**Fluxo: Publicação mensal automatizada (semi-automática)**

```
Admin acessa painel → Cria publicação "Balanço Mês X" →
Preenche dados e anexa PDF → Define data de publicação →
Sistema publica na data → Notifica assinantes do RSS →
(Opcional) Webhook dispara post automático no Instagram/X via Zapier
```

---

### Módulo 3 — CRM de Parceiros / Permutas (Prioridade #3)

#### 3.3.1 Requisitos Funcionais

**Cadastro de parceiros**

- RF-P01: Cadastro de parceiro: razão social, CNPJ (opcional para PF), nome fantasia, segmento, contato principal (nome, e-mail, telefone), observações internas.
- RF-P02: Status do parceiro: `prospect`, `ativo`, `inativo`, `cancelado`.
- RF-P03: Histórico de todos os contratos/acordos do parceiro.

**Acordos de contrapartida**

- RF-P04: Cada acordo vinculado a um parceiro contém: tipo (`patrocinio_financeiro`, `permuta`, `misto`), vigência (início/fim), valor financeiro (se houver), lista de contrapartidas acordadas.
- RF-P05: Contrapartida é uma entidade com: descrição (ex.: "Placa no setor Sul", "3 ingressos por rodada", "Menção em post"), frequência (`unico`, `por_jogo`, `mensal`), responsável interno pela entrega.
- RF-P06: Alerta automático de vencimento: 30, 15 e 7 dias antes do fim do acordo, via e-mail para o admin responsável.
- RF-P07: Renovação cria novo acordo — histórico do anterior é preservado.

**Prova de entrega**

- RF-P08: Para cada contrapartida com frequência `por_jogo` ou `mensal`, o admin registra a entrega: data, tipo de evidência (`foto`, `print_post`, `link`, `nota`), arquivo ou URL, observação.
- RF-P09: Relatório de prova de entrega exportável em PDF por acordo, com: logo do clube, dados do parceiro, período, lista de entregas com evidências e datas. Destinado a ser enviado ao parceiro para justificar renovação.
- RF-P10: Dashboard interno: acordos ativos, contrapartidas com entrega pendente no mês corrente, acordos próximos de vencer.

#### 3.3.2 Regras de Negócio

| Código | Regra                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-P01 | Acordo não pode ser deletado — apenas cancelado com motivo registrado.                                                                     |
| RN-P02 | Contrapartida do tipo `por_jogo` gera uma entrega pendente automaticamente a cada evento de matchday cadastrado no sistema.                |
| RN-P03 | Relatório de prova de entrega só pode ser gerado para acordos com ao menos uma entrega registrada — impede envio de PDF vazio ao parceiro. |
| RN-P04 | Parceiro com CNPJ válido: sistema valida formato, não faz consulta à Receita Federal no MVP.                                               |

#### 3.3.3 Fluxos Críticos

**Fluxo: Fechamento de permuta**

```
Admin cadastra parceiro → Cria acordo (tipo: permuta, vigência, contrapartidas) →
Sistema gera alertas de vencimento no calendário interno →
A cada jogo: sistema lista entregas pendentes →
Admin registra entrega com evidência →
Ao fim do período: admin gera PDF de prova de entrega →
Envia ao parceiro → Parceiro renova
```

---

### Módulo 4 — Loja (Prioridade #4)

#### 3.4.1 Requisitos Funcionais

**Catálogo**

- RF-L01: Produto com: nome, descrição, categoria, imagens (múltiplas), variantes (tamanho, cor), preço, tipo de estoque (`sob_demanda` | `estoque_fixo`).
- RF-L02: Produto `sob_demanda`: sem controle de estoque — pedido é sempre aceito e encaminhado ao fornecedor de print-on-demand (via integração ou processo manual no MVP).
- RF-L03: Produto `estoque_fixo`: quantidade em estoque decrementa APENAS ao confirmar pagamento via webhook. Pedidos abandonados não reservam estoque. Alerta admin quando estoque < threshold configurável.
- RF-L04: Produto pode ser marcado como "exclusivo para sócios" — visível a todos, comprável apenas por sócio `active`.
- RF-L05: Produto pode ser desativado sem deletar histórico de pedidos.

**Checkout**

- RF-L06: Checkout sem obrigatoriedade de cadastro (guest checkout) para produtos sem restrição de sócio.
- RF-L07: Campos de checkout: e-mail, nome, CPF (para nota fiscal), endereço de entrega (CEP + autocomplete), dados de pagamento.
- RF-L08: Pagamento via cartão ou Pix (gateway externo — ver seção 5).
- RF-L09: Confirmação de pedido por e-mail imediatamente após pagamento confirmado.
- RF-L10: Painel do admin: lista de pedidos com status (`aguardando_pagamento`, `pago`, `em_producao`, `enviado`, `entregue`, `cancelado`), rastreio (campo livre) e atualização manual de status.

**Fiscal**

- RF-L11: Emissão de nota fiscal delegada ao gateway ou integração externa (ver seção 5) — não é implementado internamente.

#### 3.4.2 Regras de Negócio

| Código  | Regra                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RN-L01  | Produto "exclusivo para sócios": ao tentar comprar, visitante não-logado é redirecionado para cadastro de sócio. Sócio `suspended` vê mensagem de regularização antes do checkout.                                                                                                                                                                                       |
| RN-L01b | Prevenção de Estoque Negativo: Decrementos de estoque (`estoque_fixo`) ocorrem sincronicamente durante o processamento do webhook de pagamento (`payment.approved`), não na criação do checkout. Isso evita esgotamento de estoque por checkouts maliciosos e elimina a necessidade de jobs de liberação de estoque. Race conditions são evitadas via database row lock. |
| RN-L02  | Estoque `sob_demanda`: pedido confirmado gera notificação por e-mail ao admin com itens, variantes e endereço — admin repassa ao fornecedor manualmente no MVP. Automação com API do fornecedor é fase 2.                                                                                                                                                                |
| RN-L03  | Cancelamento de pedido pago: reembolso é operado manualmente pelo admin via dashboard do gateway — sistema atualiza status para `cancelado` via webhook.                                                                                                                                                                                                                 |

---

### Módulo 5 — Matchday / Ingressos Digitais (Fase 2)

> Descrito em nível de requisito de alto nível para o planejamento de arquitetura. Implementação posterior ao MVP.

#### 3.5.1 Requisitos Funcionais (alto nível)

- RF-M01: Cadastro de evento (partida): data, adversário, local, setores/tiers de acesso disponíveis.
- RF-M02: Tier de ingresso: nome (ex.: "Arquibancada", "Setor Premium", "Família"), preço, capacidade, benefícios incluídos.
- RF-M03: Sócio ativo recebe desconto configurável por tier.
- RF-M04: Ingresso comprado gera QR único assinado — mesma mecânica do QR da carteirinha.
- RF-M05: App de validação (PWA) lê QR, verifica localmente (offline-capable), registra entrada.
- RF-M06: Relatório de bilheteria em tempo real para o admin.
- RF-M07: Pacotes de grupo e família: N ingressos com desconto, pagamento único.
- RF-M08: "Day pass experiência": ingresso + food voucher + item de loja — bundle configurável.

---

## 4. Requisitos Não-Funcionais

### 4.1 LGPD

- Dados pessoais coletados: nome, CPF, e-mail, telefone, data de nascimento, endereço (sócio); CNPJ, dados de contato (parceiro).
- Base legal aplicável: contrato (art. 7º, V) para sócios pagantes; legítimo interesse (art. 7º, IX) para visitantes do portal de transparência.
- Consentimento explícito para comunicações de marketing (opt-in, não opt-out).
- Direito de acesso e exclusão: sócio pode solicitar exportação dos seus dados e exclusão de conta. Exclusão anonimiza dados — registros financeiros (pagamentos) são mantidos por obrigação fiscal (5 anos).
- DPA (Data Processing Agreement) com todos os subprocessadores (gateway de pagamento, serviço de e-mail/WhatsApp).
- Dados de pagamento nunca armazenados no sistema próprio — tokenizados pelo gateway.

### 4.2 Performance

- Páginas públicas (portal de transparência, landing de sócio-torcedor, loja) devem ter cache de borda para suportar picos em dia de jogo ou cobertura de imprensa sem escalar servidores.
- Painel do sócio e painel admin: sem requisito de cache agressivo — renderização sob demanda aceitável.
- Validador de QR no matchday: deve funcionar offline (PWA com Service Worker + chave pública local para verificação de JWT). Sincronização de check-ins quando conexão restaurada.
- Meta de disponibilidade: 99,5% uptime mensal (equivale a ~3,6h de downtime/mês) — aceitável para estrutura VPS.

### 4.3 Segurança

- Autenticação: JWT com refresh token (expiração curta — 15min access, 7 dias refresh).
- Todas as rotas de admin protegidas por role `ADMIN` — separação de roles no JWT.
- Rate limiting em endpoints de cadastro e login para prevenir brute force e criação de sócios falsos.
- Logs de ações sensíveis no painel admin (quem publicou o quê, quando) — auditoria interna.
- HTTPS obrigatório em todos os ambientes.

### 4.4 Acessibilidade

- Portal de transparência e landing de sócio: WCAG 2.1 AA — foco em contraste e leitura de tela (credores idosos, imprensa).
- Painel admin e painel do sócio: WCAG 2.1 A mínimo.

### 4.5 Internacionalização

- MVP: apenas pt-BR.
- Arquitetura deve suportar i18n sem retrabalho (strings externalizadas desde o início — previsão de versão em inglês para materiais de captação de investidores futuros).

---

## 5. Integrações Externas

### 5.1 Gateway de Pagamento — Mercado Pago

- **Motivo:** suporte nativo a Pix automático (recorrente), cartão recorrente, conciliação, antifraude e emissão de nota fiscal via integração com sistemas fiscais. Elimina implementação própria de PCI-DSS.
- **Uso:** sócio-torcedor (recorrência) + loja (checkout único).
- **Integração:** SDK oficial + webhooks para atualização de status de pagamento e inadimplência.
- **Não implementar:** tokenização própria de cartão, lógica de retry de pagamento, split de pagamento — tudo delegado ao gateway.

### 5.2 Comunicação — E-mail

- Provedor transacional (ex.: Resend, SendGrid ou Amazon SES).
- Eventos disparados: boas-vindas, confirmação de pagamento, aviso de vencimento (D+1/7/15), suspensão, reativação, confirmação de pedido na loja, alerta de vencimento de acordo para admin.
- Templates em HTML responsivo — mantidos no sistema, não no provedor.

### 5.3 Comunicação — WhatsApp

- Provedor de API oficial (ex.: Z-API, Twilio for WhatsApp, ou Meta Cloud API diretamente).
- Uso: notificações de inadimplência (complementar ao e-mail) e confirmação de pedido na loja (opcional no MVP — depende de custo por mensagem).
- Opt-in explícito no cadastro do sócio.

### 5.4 Emissão Fiscal

- Integração com emissor de NF-e/NFS-e via API (ex.: NFE.io, Focus NFe, ou prefeitura de Tubarão diretamente para NFS-e).
- Escopo: loja (venda de produtos) e planos de sócio-torcedor (serviço).
- Alternativa de baixo custo no MVP: usar a emissão de nota fiscal nativa do Mercado Pago (cobre parte dos cenários) + emissão manual pelo contador para os demais.

### 5.5 Automação de Redes Sociais (Opcional — Fase 2)

- Webhook de publicação no portal de transparência → Zapier/n8n → post automático no Instagram, X, Facebook com link para a publicação.
- Mantém presença digital sem esforço manual do admin.

---

## 6. Modelo de Dados de Alto Nível

> Entidades principais e relações. Tipos de dados são indicativos — sem amarrar a dialeto SQL específico.

### 6.1 Entidades

#### `Member` (Sócio)

```
id                  UUID, PK
name                string
email               string, unique
cpf                 string, unique
phone               string
birthDate           date
address             json (opcional)
role                enum [MEMBER, ADMIN]
createdAt           datetime
referredBy          FK → Member (nullable)
```

#### `MembershipPlan` (Plano)

```
id                  UUID, PK
name                string
price               decimal
interval            enum [MONTHLY, ANNUAL]
benefits            string[] (lista para exibição)
isCorporate         boolean
maxCards            int (corporativo: N carteirinhas)
isActive            boolean
createdAt           datetime
```

#### `Subscription` (Assinatura)

```
id                  UUID, PK
memberId            FK → Member
planId              FK → MembershipPlan
status              enum [ACTIVE, PENDING, SUSPENDED, CANCELLED]
currentPeriodStart  datetime
currentPeriodEnd    datetime
gatewaySubscriptionId string (ID externo no gateway)
cancelledAt         datetime (nullable)
createdAt           datetime
```

#### `Payment` (Pagamento)

```
id                  UUID, PK
subscriptionId      FK → Subscription (nullable — pode ser loja)
orderId             FK → Order (nullable)
gatewayPaymentId    string (ID externo)
amount              decimal
status              enum [PENDING, PAID, FAILED, REFUNDED]
method              enum [CREDIT_CARD, PIX]
paidAt              datetime (nullable)
createdAt           datetime
```

#### `MembershipCard` (Carteirinha)

```
id                  UUID, PK
memberId            FK → Member
subscriptionId      FK → Subscription
qrToken             string (JWT assinado, unique)
validUntil          datetime
isActive            boolean
createdAt           datetime
```

#### `GamificationEvent` (Evento de Gamificação)

```
id                  UUID, PK
memberId            FK → Member
type                enum [CHECKIN, REFERRAL, ANNIVERSARY, STREAK_6M, STREAK_12M]
points              int
metadata            json (ex.: { eventId, referredMemberId })
createdAt           datetime
```

#### `Poll` (Enquete)

```
id                  UUID, PK
title               string
description         text
options             json ([{ id, text }])
opensAt             datetime
closesAt            datetime
quorumMinimum       int
requiresSeniority   boolean (se true: só vota com 12+ meses de adimplência)
status              enum [DRAFT, OPEN, CLOSED]
createdAt           datetime
```

#### `PollVote` (Voto)

```
id                  UUID, PK
pollId              FK → Poll
memberId            FK → Member
optionId            string
createdAt           datetime
UNIQUE(pollId, memberId)
```

#### `TransparencyPost` (Publicação de Transparência)

```
id                  UUID, PK
title               string
category            enum [BALANCO_MENSAL, STATUS_DIVIDAS, ATA_ASSEMBLEIA, COMPOSICAO_SOCIETARIA, DOCUMENTO_SAF, OUTRO]
referenceMonth      int (nullable)
referenceYear       int (nullable)
body                text (markdown)
attachmentUrl       string (nullable)
publishedAt         datetime
scheduledFor        datetime (nullable)
version             int (default 1)
supersededById      FK → TransparencyPost (nullable)
isArchived          boolean
createdBy           FK → Member (admin)
```

#### `DebtRecord` (Registro de Dívida)

```
id                  UUID, PK
creditorName        string
creditorGroup       string (nullable — para agrupar credores)
originalAmount      decimal
negotiatedAmount    decimal (nullable)
paidAmount          decimal (default 0)
status              enum [EM_NEGOCIACAO, EM_DIA, ATRASADO, QUITADO]
publicNote          text (nullable)
updatedAt           datetime
```

#### `DebtSnapshot` (Snapshot de Passivo)

```
id                  UUID, PK
totalOriginal       decimal
totalNegotiated     decimal
totalPaid           decimal
totalRemaining      decimal
snapshotDate        date
createdBy           FK → Member (admin)
```

#### `Partner` (Parceiro)

```
id                  UUID, PK
legalName           string
tradeName           string
cnpj                string (nullable)
segment             string
status              enum [PROSPECT, ACTIVE, INACTIVE, CANCELLED]
contactName         string
contactEmail        string
contactPhone        string
notes               text
createdAt           datetime
```

#### `SponsorshipDeal` (Acordo)

```
id                  UUID, PK
partnerId           FK → Partner
type                enum [FINANCEIRO, PERMUTA, MISTO]
financialValue      decimal (nullable)
startDate           date
endDate             date
status              enum [ACTIVE, COMPLETED, CANCELLED]
ownerId             FK → Member (admin responsável)
notes               text
createdAt           datetime
```

#### `Deliverable` (Contrapartida)

```
id                  UUID, PK
dealId              FK → SponsorshipDeal
description         string
frequency           enum [UNICO, POR_JOGO, MENSAL]
ownerId             FK → Member (admin responsável)
```

#### `DeliveryProof` (Prova de Entrega)

```
id                  UUID, PK
deliverableId       FK → Deliverable
matchEventId        FK → MatchEvent (nullable — para entregas atreladas a jogo)
deliveredAt         date
evidenceType        enum [FOTO, PRINT_POST, LINK, NOTA]
fileUrl             string (nullable)
linkUrl             string (nullable)
notes               text
createdBy           FK → Member (admin)
```

#### `Product` (Produto da Loja)

```
id                  UUID, PK
name                string
description         text
category            string
images              string[]
variants            json ([{ sku, size, color, priceAdjustment }])
basePrice           decimal
stockType           enum [SOB_DEMANDA, ESTOQUE_FIXO]
stockQuantity       int (nullable — apenas ESTOQUE_FIXO)
stockAlertThreshold int (nullable)
membersOnly         boolean
isActive            boolean
createdAt           datetime
```

#### `Order` (Pedido)

```
id                  UUID, PK
customerId          FK → Member (nullable — guest)
guestEmail          string (nullable)
guestCpf            string (nullable)
items               json ([{ productId, variantSku, quantity, unitPrice }])
shippingAddress     json
status              enum [AGUARDANDO_PAGAMENTO, PAGO, EM_PRODUCAO, ENVIADO, ENTREGUE, CANCELADO]
trackingCode        string (nullable)
total               decimal
createdAt           datetime
```

#### `MatchEvent` (Evento / Partida)

```
id                  UUID, PK
name                string
date                datetime
location            string
status              enum [SCHEDULED, ONGOING, FINISHED, CANCELLED]
createdAt           datetime
```

### 6.2 Relações Principais

```
Member          1 ──< Subscription
Member          1 ──< GamificationEvent
Member          1 ──< MembershipCard
Subscription    1 ──< Payment
Subscription    1 ──< MembershipCard
Partner         1 ──< SponsorshipDeal
SponsorshipDeal 1 ──< Deliverable
Deliverable     1 ──< DeliveryProof
Order           1 ──< Payment
Poll            1 ──< PollVote
Member          1 ──< PollVote
TransparencyPost 0..1 ── TransparencyPost (supersededBy)
MatchEvent      1 ──< GamificationEvent (type: CHECKIN)
```

---

## 7. Stack & Arquitetura

> A definir. Este documento é tech-agnostic. As decisões abaixo representam uma proposta inicial sujeita a revisão antes da implementação.

**Proposta:**

| Camada   | Tecnologia proposta   | Justificativa                                                                                                                      |
| -------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | Next.js (App Router)  | SSR para SEO do portal de transparência; RSC para caching de páginas públicas; único app com rotas separadas por domínio funcional |
| API      | Fastify + TypeScript  | Throughput alto para webhooks do gateway; schema validation nativa                                                                 |
| ORM      | Prisma                | Type-safety no modelo de dados; migrations versionadas                                                                             |
| Banco    | PostgreSQL            | ACID para dados financeiros                                                                                                        |
| Cache    | Redis                 | Sessão de login + cache de páginas públicas de alto tráfego                                                                        |
| Infra    | Docker Compose em VPS | Custo mínimo; portabilidade para cloud quando crescer                                                                              |
| Gateway  | Mercado Pago          | Ver seção 5.1                                                                                                                      |
| E-mail   | Resend                | Developer experience; preço acessível no volume inicial                                                                            |

---

## 8. Roadmap

### MVP (Fase 1) — ~12 semanas estimadas

| Semana | Entregável                                                                    |
| ------ | ----------------------------------------------------------------------------- |
| 1–2    | Setup infra (Docker, CI/CD), modelo de dados completo, autenticação           |
| 3–5    | Módulo Sócio-Torcedor: cadastro, planos, recorrência, carteirinha, webhooks   |
| 6–7    | Módulo Portal de Transparência: publicações, dashboard de dívidas, documentos |
| 8–9    | Módulo CRM de Parceiros: cadastro, acordos, provas de entrega, relatório PDF  |
| 10–11  | Módulo Loja: catálogo, checkout, painel de pedidos                            |
| 12     | QA, testes de carga, LGPD review, treinamento do admin, go-live               |

### Fase 2 — pós-MVP

- Módulo Matchday / Ingressos Digitais (seção 3.5).
- Validador de QR como PWA instalável (offline-first).
- Integração automática com fornecedor de print-on-demand (API).
- Automação de redes sociais via webhook.
- Resgate de pontos de gamificação por benefícios.
- App mobile (Flutter) — se validado pela base de sócios.
- Relatórios financeiros exportáveis para o contador (CSV/Excel).

---

## 9. Critérios de Aceite por Módulo

### Módulo 1 — Sócio-Torcedor

- [ ] Sócio consegue se cadastrar, escolher plano, pagar via Pix e receber carteirinha digital em menos de 5 minutos.
- [ ] Webhook do gateway atualiza status de adimplência em ≤ 30 segundos após o evento.
- [ ] QR code da carteirinha é verificável offline pelo validador sem chamada ao servidor.
- [ ] Sócio suspenso tem acesso bloqueado automaticamente em D+30 sem ação manual do admin.
- [ ] Dashboard público de metas exibe contagem correta em tempo real após novo pagamento confirmado.
- [ ] Enquete respeita elegibilidade de 12 meses e registra apenas um voto por sócio.

### Módulo 2 — Portal de Transparência

- [ ] Publicação agendada vai ao ar na data/hora definida sem intervenção manual.
- [ ] Publicação não pode ser editada após publicação — somente nova versão é criada.
- [ ] Dashboard de dívidas exibe gráfico de evolução com dados de todos os snapshots.
- [ ] RSS feed retorna as 20 publicações mais recentes por categoria com estrutura válida.
- [ ] Qualquer visitante acessa qualquer conteúdo sem login.

### Módulo 3 — CRM de Parceiros

- [ ] Admin recebe alerta por e-mail em D-30, D-15 e D-7 antes do vencimento de cada acordo.
- [ ] Sistema bloqueia geração de relatório PDF para acordo sem nenhuma entrega registrada.
- [ ] Parceiro cancelado mantém histórico completo de acordos e entregas acessível ao admin.
- [ ] Contrapartida `por_jogo` gera entrega pendente automaticamente ao cadastrar evento de matchday.

### Módulo 4 — Loja

- [ ] Produto "exclusivo para sócios" redireciona visitante para cadastro de sócio ao tentar comprar.
- [ ] Sócio `suspended` vê mensagem de regularização antes do checkout.
- [ ] Pedido `sob_demanda` gera notificação por e-mail ao admin com todos os dados necessários para repassar ao fornecedor.
- [ ] Status de estoque `estoque_fixo` nunca vai abaixo de 0 — race condition tratada com lock de nível de banco.
- [ ] Webhook de reembolso do gateway atualiza status do pedido para `cancelado` automaticamente.
