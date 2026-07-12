# Flinker App — Arquitetura e Decisões

Este documento consolida o **estado atual** das decisões de arquitetura do frontend.
Para o histórico de como chegamos aqui, ver `CHANGELOG.md`. Para o progresso de
migração tela por tela, ver `docs/FRONTEND_MIGRATION.md`.

## Origem do projeto

O código-base foi gerado pelo [Lovable](https://lovable.dev) a partir do protótipo em
`useflinker.com`, já como um app completo (22 telas) com um backend próprio em
**Supabase** (autenticação + Postgres + RLS). Ao inspecionar o export, esse backend
paralelo cobria — e em alguns pontos ultrapassava — o escopo do backend Laravel que já
estava em desenvolvimento (`flinker_backend`).

**Decisão**: abandonar o Supabase e integrar as telas com o backend Laravel, mesmo sendo
mais trabalho no curto prazo. Motivo: sem usuários reais ainda rodando no app, não havia
pressão de prazo, e a prioridade explícita do projeto era ter uma base de arquitetura
sólida e sob controle da equipe (PHP/Laravel é a stack de domínio da equipe), em vez de
ficar depend­ente da infraestrutura e das convenções do Supabase (RLS em SQL, Edge
Functions) pra manter a lógica de negócio.

## Stack

Vite + React + TypeScript + Tailwind + shadcn/ui (mantidos do Lovable). Sem mudança de
stack de UI — só a camada de dados (antes Supabase, agora API Laravel) foi substituída.

## Organização do repositório

- **`main`** — código original gerado pelo Lovable, intocado. Serve de referência/backup;
  não recebe commits do trabalho de integração.
- **`laravel-migration`** — branch de trabalho ativo, onde toda a integração acontece.

## Camada de dados (`src/lib/`)

Toda comunicação com o backend passa por `src/lib/`, substituindo os antigos
`src/integrations/supabase/*`:

- **`api.ts`** — cliente HTTP base. Guarda o token Sanctum em `localStorage`
  (chave `flinker_token`), injeta `Authorization: Bearer` em toda requisição, e lança
  `ApiError` (com `.status` e `.errors` de validação) em respostas não-OK. Em 401, limpa
  o token automaticamente.
- **`types.ts`** — tipos espelhando os Resources do Laravel. **Mantidos manualmente em
  sincronia** — não há geração automática a partir do backend ainda. Se um campo mudar
  lá, precisa atualizar aqui também.
- **`auth.ts`**, **`flinks.ts`**, **`matches.ts`**, **`schedule.ts`** — um módulo por
  domínio, cada um só com funções finas que chamam `api.get/post/put/delete` e tipam o
  retorno. Novas features (Carteira, Reputação, Admin) devem seguir o mesmo padrão
  (`src/lib/wallet.ts`, etc.) em vez de chamar `fetch`/`api` direto de dentro das telas.

## Autenticação (`AuthContext.tsx`)

- Guarda `user` (tipo `User` de `types.ts`, com `professional`/`company` aninhados
  quando aplicável), não mais `user`+`session` separados do Supabase.
- **Mapeamento de nomenclatura**: o backend usa `profile: "professional" | "company" |
  "admin"`; o frontend (herdado do Lovable) usa `role: "worker" | "company" | "admin"`
  em rotas, `ProtectedRoute` e nas 22 telas. Em vez de renomear tudo, `profileToFrontendRole()`
  em `types.ts` faz a tradução num único lugar.
- `refreshUser()` — recarrega `/users/me`; chamar depois de qualquer tela que edite o
  perfil (ex: `CompanyRegistrationForm`, `ProfileRegistrationForm`), pra manter o
  `AuthContext` sincronizado sem precisar de reload da página.
- `setAuthenticatedUser()` — usado só pelo `Login.tsx` logo após login/cadastro bem-sucedido.

## Convenções ao migrar uma tela

1. Trocar imports de `@/integrations/supabase/client` por `@/lib/api` + o módulo de
   domínio relevante (`@/lib/flinks`, `@/lib/matches`, etc.).
2. Erros de API: capturar com `catch (error)`, checar `error instanceof ApiError` pra
   mostrar a mensagem de validação do backend (`error.message` ou `error.fieldError(campo)`),
   com uma mensagem genérica de fallback.
3. Não inventar campos que a UI usa mas o backend não tem — ou adicionar o campo no
   backend (como fizemos com `companies.address`) ou simplificar a UI. Documentar a
   decisão no `CHANGELOG.md` dos dois projetos.
4. Preservar validações/formatações client-side já existentes (CPF, CNPJ, telefone, CEP)
   — só trocar a chamada final de salvamento.
5. Ao terminar, rodar `grep -rl "supabase" src/` pra confirmar que a tela saiu da lista.

## O que ainda não foi migrado

Ver a tabela completa em `docs/FRONTEND_MIGRATION.md`. Resumo: Carteira/Pagamento (Fase 4
do backend), Reputação (Fase 5), Admin (Fase 6), reset de senha (endpoint não existe),
Chat e swipe-em-profissionais-direto (features fora do escopo atual do backend).
