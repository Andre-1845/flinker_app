# Flinker App (Frontend)

App web/mobile do Flinker — telas geradas originalmente pelo Lovable, em migração para
consumir o backend Laravel (`flinker_backend`) em vez do Supabase.

## Status da migração

Veja [`docs/FRONTEND_MIGRATION.md`](./docs/FRONTEND_MIGRATION.md) para o progresso
detalhado, tela por tela, e o que ainda depende do Supabase.

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
