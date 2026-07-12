# Changelog — Flinker App (Frontend)

Registro cronológico das mudanças, decisões de arquitetura e o motivo de cada uma.
Para o "estado atual" consolidado, ver `docs/ARCHITECTURE.md` (decisões estruturais) e
`docs/FRONTEND_MIGRATION.md` (checklist de progresso tela por tela).

## [Etapa 3] — Telas do profissional

**Adicionado**
- `src/lib/matches.ts` e `src/lib/schedule.ts` — serviços de API pra Match e Agenda.

**Migrado (Supabase → API Laravel)**
- `GigFeed.tsx` — busca Flinks ativos reais, com tentativa de geolocalização do navegador;
  exclui Flinks já com interesse do profissional.
- `Matches.tsx` — lista, confirma e cancela matches reais. Simplificado o enum de status
  pra bater com o backend.
- `GigCheckIn.tsx` — recebe `matchId` pela rota (`/gig-checkin/:matchId`) e chama o
  check-in real.
- `Schedule.tsx` (aba Agenda) — calendário construído a partir dos matches reais.
- `WorkerDashboard.tsx` e `Profile.tsx` — dados reais do usuário (nome, reputação, Flinks).
- `ProfileRegistrationForm.tsx` — troca de `supabase.rpc` por `PUT /api/professionals/{id}`.

**Correções**
- `GigCheckIn.tsx` **nunca chamava nenhum backend** — a validação de distância rodava
  inteiramente no cliente contra um local mockado (Vila Olímpia, SP fixo), então nenhum
  check-in real era salvo. Corrigido para chamar `POST /matches/{id}/checkin`.
- Botão "Sair da conta" em `Profile.tsx` não tinha nenhum `onClick` — conectado ao `signOut`.

**Ainda mock (documentado, sem mudança)**
- Aba "Chat" do `Schedule.tsx` — sem backend de mensagens ainda.
- `WorkerPublicProfile.tsx` — sem endpoint público de perfil ainda.

## [Etapa 2] — Telas da empresa

**Adicionado**
- `src/lib/flinks.ts` — serviço de API pra Flink (criar, listar, atualizar, remover).
- `src/pages/CreateFlink.tsx` — **tela nova**. O Lovable nunca chegou a construir essa
  tela (o botão "Publicar Novo Flink" só mostrava um toast "em breve"). Preview do
  cálculo de margem em tempo real.
- `AuthContext.refreshUser()` — recarrega `/users/me` depois de editar o perfil.

**Migrado**
- `useCompanyProfile.ts` — deriva o status direto do `user.company` (sem chamada extra).
- `CompanyRegistrationForm.tsx` — troca de `supabase.rpc` por `PUT /users/me` + `PUT /companies/{id}`.
- `CompanyDashboard.tsx` — Flinks reais da empresa em vez de estatísticas mockadas.

**Backend (mudança relacionada)**
- Adicionado campo `address` em `companies` — não existia na spec original, mas as
  telas do Lovable esperavam.

**Decisão registrada**
- `CompanyGigFeed.tsx` (empresa "dá swipe" em profissionais direto, sem Flink publicado)
  — mantida no roadmap futuro. Precisa de endpoint novo de sugestão/ranking de
  profissionais, ainda não construído. Continua 100% mock por enquanto.

## [Etapa 1] — Fundação: cliente de API e autenticação

**Contexto**: o projeto foi recebido como um código já completo gerado pelo Lovable,
com backend próprio em Supabase (auth + Postgres + RLS), cobrindo (e ultrapassando) o
escopo do MVP. Decisão tomada com o cliente: abandonar o Supabase e integrar essas telas
com o backend Laravel já em desenvolvimento, priorizando arquitetura e controle em vez de
velocidade imediata (sem usuários reais ainda, não havia pressão de prazo).

**Adicionado**
- `src/lib/api.ts` — cliente HTTP (substitui `src/integrations/supabase/client.ts`),
  guarda o token Sanctum no `localStorage` e injeta `Authorization: Bearer` automaticamente.
- `src/lib/types.ts` — tipos TypeScript espelhando os Resources da API Laravel.
- `src/lib/auth.ts` — `login`, `registerProfessional`, `registerCompany`, `logout`,
  `fetchCurrentUser`.
- `AuthContext.tsx` — reescrito para o backend Laravel, mantendo a nomenclatura de papel
  já usada no resto do app (`worker`/`company`/`admin`).
- `Login.tsx` — cadastro de profissional (CPF, telefone) e empresa (CNPJ, responsável),
  login com email/senha.

**Removido**
- Login com Google (`lovable.auth.signInWithOAuth`) — decisão do backend: só email/senha
  no MVP.

**Organização do repositório**
- Criada a branch `laravel-migration` pra todo o trabalho de integração, mantendo `main`
  como o código original do Lovable, intocado, pra referência/comparação futura.
