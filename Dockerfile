# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Dockerfile do frontend Flinker (React + Vite, SPA estática).
#
# Build de duas etapas: compila os assets com Node e serve o resultado com
# Nginx puro — a imagem final não carrega Node nem o código-fonte, só os
# arquivos estáticos gerados. Roda em qualquer provedor com suporte a
# Docker (mesmo raciocínio de flexibilidade do backend).
#
# A URL da API é definida em BUILD TIME (Vite embute VITE_API_URL no bundle
# na hora do `npm run build`, não dá pra trocar depois só mudando variável de
# ambiente do container) — passe via --build-arg VITE_API_URL=... ou pelo
# `args:` do serviço no docker-compose.yml.
# ---------------------------------------------------------------------------

FROM oven/bun:1-alpine AS build
WORKDIR /app

# O projeto é gerenciado com Bun (tem bun.lock, não package-lock.json) — usar
# bun aqui garante a mesma árvore de dependências que roda no ambiente de
# desenvolvimento, em vez do npm resolver algo parecido, mas não idêntico.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

RUN bun run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
