# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SuperSer (Dashboard360)** is a React Native / Expo app for behavioral and developmental assessment of children ("Acompanhamento Comportamental e do Desenvolvimento"). Evaluators (avaliadores) rate children across multiple developmental contexts using a 1-5 scale. The app is written in Portuguese (Brazilian).

## Commands

- `npx expo start` — Start the dev server (or `npm start`)
- `npx expo start --web` / `--ios` / `--android` — Start for a specific platform
- `npm run lint` (runs `expo lint`) — Lint with ESLint flat config
- No test framework is configured

## Architecture

### Routing & Navigation
Uses **expo-router** (file-based routing) with a Stack navigator. Entry point is `expo-router/entry` (set in package.json `main`). All screens live under `app/`.

### Auth Flow
Authentication state is managed via a React Context (`AuthContext`) defined in `app/_layout.tsx`. The root layout checks for an existing Supabase session on mount, redirects unauthenticated users to `/login`, and authenticated users to `/criancas`. The `useAuth()` hook provides `auth`, `setAuth`, and `logout` throughout the app.

### Screen Flow
1. **`/login`** — Email/password login and signup via Supabase Auth
2. **`/criancas`** — Select a child (criança) linked to the current evaluator via `vinculos` table
3. **`/` (index)** — Dashboard showing all developmental contexts with summary scores for the selected child
4. **`/context/[id]`** — Detail view of a context showing categories and indicators with latest ratings
5. **`/avaliar/[contextId]/[categoryIndex]`** — Modal screen to rate indicators (1-5 scale) for a category; upserts to `avaliacoes` table
6. **`/historico/[contextId]`** — History of evaluations grouped by date

### Backend (Supabase)
All data access goes through `data/supabase.ts` which exports a single `supabase` client. Supabase credentials are placeholder constants that must be replaced with real values. Key tables:
- `avaliadores` — evaluator profiles (linked to Supabase Auth via `auth_id`)
- `criancas` — children being evaluated
- `vinculos` — many-to-many relationship between evaluators and children
- `contextos` — developmental contexts (e.g., family, school)
- `categorias` — categories within a context
- `indicadores` — behavioral indicators within a category
- `avaliacoes` — actual evaluation ratings (upsert key: `crianca_id, avaliador_id, indicador_id, data`)
- `v_resumo_contexto`, `v_ultima_avaliacao` — database views for aggregated data

Session persistence uses `@react-native-async-storage/async-storage` on native platforms; on web, persistence is disabled.

### Styling
Inline `StyleSheet.create()` in each screen file. Primary brand color is `#1E3A5F` (dark navy). Each context has its own `cor` and `cor_clara` colors stored in the database. Rating colors: green (4-5), amber (3), red (1-2).

### Key Conventions
- TypeScript with strict mode enabled
- Path alias `@/*` maps to project root
- All UI text is in Brazilian Portuguese
- Icons use `@expo/vector-icons` (MaterialIcons)
- App logo is at `assets/logo.png`, rendered via `app/Logo.tsx`
- Child/context IDs and names are passed between screens as URL query parameters
