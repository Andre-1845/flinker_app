# Migração do Frontend: Supabase → API Flinker (Laravel)

Este projeto foi originalmente gerado pelo Lovable com um backend completo em Supabase
(auth + Postgres + RLS). Decisão tomada: **abandonar o Supabase e usar o backend Laravel**
(`flinker_backend`), priorizando controle de arquitetura em vez de velocidade imediata.

Este documento rastreia o progresso da migração, tela por tela, pra dar continuidade entre
sessões de trabalho.

## Peças da fundação (Etapa 1 — concluída)

- `src/lib/api.ts` — cliente HTTP que substitui `src/integrations/supabase/client.ts`.
  Guarda o token Sanctum no `localStorage` (chave `flinker_token`) e injeta o header
  `Authorization` automaticamente.
- `src/lib/types.ts` — tipos TypeScript espelhando os Resources da API Laravel. **Mantidos
  manualmente em sincronia** — se um campo mudar no backend, atualizar aqui também.
- `src/lib/auth.ts` — funções `login`, `registerProfessional`, `registerCompany`, `logout`,
  `fetchCurrentUser`.
- `src/contexts/AuthContext.tsx` — reescrito para usar o backend Laravel. Mantém a mesma
  nomenclatura de papel (`worker`/`company`/`admin`) que o resto do app já usava, mapeando
  `profile: "professional"` (backend) → `role: "worker"` (frontend) via
  `profileToFrontendRole()` em `types.ts`.
- `src/pages/Login.tsx` — reescrito. Login com email/senha, cadastro de profissional
  (nome, CPF, telefone) e empresa (responsável, CNPJ, CPF do responsável, telefone) — os
  campos batem com o que o `RegisterProfessionalRequest`/`RegisterCompanyRequest` do
  Laravel exigem. **Login com Google foi removido** (decisão do backend: só email/senha
  no MVP, ver `docs/ARCHITECTURE.md` do `flinker_backend`).
- `src/pages/Onboarding.tsx` e `src/components/ProtectedRoute.tsx` — **não precisaram de
  mudança**, já eram independentes do Supabase (só usam estado local/guest role).

## Variável de ambiente necessária

Adicionar ao `.env` (ou `.env.local`) do frontend:
```
VITE_API_URL=http://localhost:8000/api
```
Se não for definida, `src/lib/api.ts` usa esse valor como padrão.

## Pendências conhecidas (quebradas até serem migradas)

- **`src/components/CompanyRegistrationForm.tsx`** e **`src/components/ProfileRegistrationForm.tsx`**
  ainda chamam `supabase.rpc(...)` diretamente. Como o login agora não cria mais uma sessão
  Supabase, essas telas vão falhar se forem abertas. Migrar na Etapa 2/3 para
  `PUT /api/professionals/{id}` e `PUT /api/companies/{id}`.
- **`src/pages/ForgotPassword.tsx`** e **`src/pages/ResetPassword.tsx`** dependem de
  `supabase.auth.resetPasswordForEmail(...)`. **O backend Laravel ainda não tem endpoint de
  reset de senha** — precisa ser construído antes de migrar essas telas (ou lançar o MVP
  sem essa funcionalidade por enquanto).
- **`src/hooks/useCompanyProfile.ts`** ainda lê direto do Supabase.
- **`src/pages/GigFeed.tsx`** ainda usa Supabase para localStorage de dismissals + queries.

## Etapa 2 — Telas da empresa (concluída)

- **Backend**: adicionado campo `address` em `companies` (não existia na spec original,
  mas as telas do Lovable esperavam) — ver migration `2026_07_15_000001` no `flinker_backend`.
- `src/lib/flinks.ts` — novo serviço com as chamadas de API relacionadas a Flink
  (`createFlink`, `listCompanyFlinks`, `listActiveFlinks`, `getFlink`, `updateFlink`, `deleteFlink`).
- `src/hooks/useCompanyProfile.ts` — reescrito para derivar o status (`incomplete`/`complete`)
  direto do `user.company` já carregado no `AuthContext`, em vez de uma chamada separada ao
  Supabase. **`verified` nunca é `true` ainda** — a Flinker não tem conceito de empresa
  verificada no backend (ficaria para a Fase 6/Admin).
- `AuthContext.tsx` — ganhou um `refreshUser()` (recarrega `/users/me`), usado depois de
  salvar o cadastro da empresa.
- `src/components/CompanyRegistrationForm.tsx` — reescrito para chamar `PUT /api/users/me`
  (nome) e `PUT /api/companies/{id}` (demais campos) em vez de `supabase.rpc`. UI e validação
  de campos (CNPJ, CPF, busca de CEP via ViaCEP) mantidas como estavam.
- `src/pages/CreateFlink.tsx` — **tela nova**, não existia nem como mock no Lovable (o botão
  "Publicar Novo Flink" só mostrava um toast "em breve"). Formulário completo — atividade,
  local, latitude/longitude, datas, requisitos, valor líquido — com preview do cálculo de
  margem em tempo real. Chama `POST /api/flinks`.
- `src/pages/CompanyDashboard.tsx` — reescrito para buscar os Flinks reais da empresa
  (`GET /api/flinks/company/{id}`) em vez de estatísticas e "profissionais sugeridos"
  mockados. Botão de publicar Flink agora navega para `/company-flinks/new`.
- **`src/pages/CompanyGigFeed.tsx` — ainda 100% mock.** Decisão tomada: **essa feature fica
  no roadmap** (empresa "dá swipe" em profissionais direto, sem depender de um Flink
  publicado). Precisa de um endpoint novo no backend (ex: `GET /professionals/suggested` ou
  similar, com lógica de sugestão/ranking) antes de migrar essa tela — ainda não construído.
  Por enquanto continua mock, sinalizada no código.

## Etapa 3 — Telas do profissional (concluída)

- `src/lib/matches.ts` — novo serviço com as chamadas de Match (`listMyMatches`,
  `expressInterest`, `acceptMatch`, `confirmMatch`, `checkInMatch`, `cancelMatch`).
- `src/lib/schedule.ts` — novo serviço com as chamadas de Agenda (`listMySchedule`,
  `blockSchedule`).
- `src/pages/GigFeed.tsx` — reescrito. Busca Flinks ativos via `GET /flinks/active`
  (tenta usar a geolocalização do navegador pra priorizar por proximidade; se o
  usuário negar a permissão, busca sem filtro de distância), exclui Flinks em que o
  profissional já demonstrou interesse. "Aceitar" (swipe direita) chama `expressInterest`.
  Removido o fallback de dados mock que existia antes.
- `src/pages/Matches.tsx` — reescrito. Lista via `GET /matches`, "Confirmar Aceite" chama
  `confirmMatch`, cancelamento chama `cancelMatch`. Simplificado o enum de status pra bater
  com o backend (`pending`/`accepted`/`confirmed`/`rejected`/`cancelled` — os status fictícios
  do mock como `partially_accepted`/`in_progress`/`paid` foram removidos). Adicionado botão
  "Fazer Check-in" quando o match está confirmado e ainda não teve check-in.
- `src/pages/GigCheckIn.tsx` — reescrito. **Antes fazia todo o cálculo de distância só no
  cliente, contra um local mockado, e nunca chamava nenhum backend** (o check-in nunca era
  salvo de verdade). Agora recebe o `matchId` pela rota (`/gig-checkin/:matchId`), busca o
  match real e chama `POST /matches/{id}/checkin` — a validação de distância roda no
  servidor (`GeoDistanceService`).
- `src/pages/Schedule.tsx` — a aba "Agenda" agora busca os matches reais (`GET /matches`) e
  monta o calendário a partir deles. **A aba "Chat" continua mock** — não existe sistema de
  mensagens no backend ainda (fora do MVP por enquanto).
- `src/pages/WorkerDashboard.tsx` — reescrito. Nome e reputação reais do usuário, contagem
  de Flinks concluídos via matches, Flinks recomendados via `GET /flinks/active`, card "hoje"
  aponta pro check-in do próximo match confirmado. Saldo/carteira continua "Em breve"
  (depende da Fase 4 do backend).
- `src/pages/Profile.tsx` — wiring mínimo: nome real do usuário, `registrationComplete`
  derivado de `professional.address`/`pix_key`, botão "Sair da conta" conectado ao `signOut`
  (antes não tinha nenhum `onClick`!). **Avaliações, badges e gamificação continuam mock**
  (não há backend de reputação/avaliações ainda — Fase 5).
- `src/components/ProfileRegistrationForm.tsx` — mesmo padrão do `CompanyRegistrationForm`:
  troca de `supabase.rpc` por `PUT /api/professionals/{id}`.

Depois da Etapa 3, `grep -rl "supabase" src/` só retorna `ForgotPassword.tsx` e
`ResetPassword.tsx` — já documentados como bloqueados abaixo.

## Roteiro das próximas etapas

| Etapa | Telas | Depende de (backend) |
|---|---|---|
| 2 ✅ | `CompanyDashboard`, `CreateFlink` (nova), `CompanyProfile`, `CompanyRegistrationForm` | Fase 2 (Flink) — já pronto |
| 3 ✅ | `GigFeed`, `Matches`, `GigCheckIn`, `Schedule` (agenda), `WorkerDashboard`, `Profile`, `ProfileRegistrationForm` | Fase 3 (Match/Agenda/Check-in) — já pronto |
| 4 | `Wallet`, `CompanyWallet`, `FinancialHistory` | Fase 4 do backend (Carteira/Mercado Pago) — **ainda não construída** |
| 5 | Reputação/avaliações (sem tela dedicada ainda identificada — a mapear) | Fase 5 do backend — **ainda não construída** |
| 6 | `AdminPanel` | Fase 6 do backend — **ainda não construída** |
| — | `Training`, `TrainingFeed` | Módulo fora do MVP por decisão registrada em `docs/ARCHITECTURE.md` do backend — aguardando definição de escopo |
| — | `VerificationSubscription` | Não mapeado na spec original — avaliar se entra no MVP |
| — | `Chat` | Não mapeado na spec original — avaliar se entra no MVP |
| — | `WorkerPublicProfile` | Tela pública de perfil — continua mock, sem endpoint público dedicado ainda |
| — | `ForgotPassword`, `ResetPassword` | Precisa de endpoint novo no backend (não existe ainda) |
| — | `CompanyGigFeed` (swipe em profissionais) | Feature mantida no roadmap — precisa de endpoint novo de sugestão/ranking de profissionais (ainda não construído) |

## Mapeamento de nomenclatura (Supabase → Laravel)

| Conceito | Supabase (Lovable) | Laravel (nosso backend) |
|---|---|---|
| Vaga/oportunidade | `gigs` | `flinks` |
| Candidatura/match | `gig_matches` | `matches` (model `FlinkMatch`) |
| Papel "profissional" | `worker` | `professional` |
| Valor | `payment_amount` (único campo) | `net_value` + `platform_margin` + `total_value` (ver `PricingService`) |
