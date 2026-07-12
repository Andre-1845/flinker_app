# Flinker App (Frontend)

App web/mobile do Flinker — telas geradas originalmente pelo Lovable, em migração para
consumir o backend Laravel (`flinker_backend`) em vez do Supabase.

## Documentação

- [`CHANGELOG.md`](./CHANGELOG.md) — histórico de mudanças, decisões e correções por etapa
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — arquitetura e decisões estruturais
- [`docs/FRONTEND_MIGRATION.md`](./docs/FRONTEND_MIGRATION.md) — progresso da migração, tela por tela

## Rodando localmente

```bash
npm install
cp .env .env.local   # ajuste VITE_API_URL se o backend não estiver em localhost:8000
npm run dev
```

Pré-requisito: o backend (`flinker_backend`) precisa estar rodando (`php artisan serve`)
para as telas já migradas funcionarem.

## Stack

Vite + React + TypeScript + Tailwind + shadcn/ui
