# GoodReads Frontend

Premium social reading frontend built with React, Vite, and TypeScript.

This project explores a modern GoodReads-inspired product experience focused on:

- book discovery
- editorial browsing
- reader profiles
- social reviews
- community activity
- library management
- notifications, messages, and settings

## Stack

- React 18
- Vite 5
- TypeScript
- React Router
- Framer Motion
- Lucide React
- ESLint
- Vitest

## Product Areas

The app currently includes these main views:

- `Home`
- `Explore`
- `Search`
- `Readers`
- `Community`
- `Book Details`
- `Profile`
- `My Library`
- `Messages`
- `Notifications`
- `Settings`
- `Login / Register`

Protected routes are already in place for authenticated areas such as:

- `My Library`
- `Messages`
- `Notifications`
- `Settings`

## Frontend Architecture

The app is organized around a small client layer plus React contexts:

- App shell and routing: [src/routes/AppRouter.tsx](/C:/Users/narci/OneDrive/Documentos/Proyectos%20Info/Proyectos%20U/goodreads/frontend/src/routes/AppRouter.tsx)
- Auth and social state: [src/context/AuthContext.tsx](/C:/Users/narci/OneDrive/Documentos%20Info/Proyectos%20U/goodreads/frontend/src/context/AuthContext.tsx)
- Library state: [src/context/LibraryContext.tsx](/C:/Users/narci/OneDrive/Documentos/Proyectos%20Info/Proyectos%20U/goodreads/frontend/src/context/LibraryContext.tsx)
- API adapter layer: [src/services/api](/C:/Users/narci/OneDrive/Documentos/Proyectos%20Info/Proyectos%20U/goodreads/frontend/src/services/api)
- Shared domain types: [src/types/index.ts](/C:/Users/narci/OneDrive/Documentos/Proyectos%20Info/Proyectos%20U/goodreads/frontend/src/types/index.ts)

The current build uses mock persistence behind the API layer, which makes it easier to swap in a real backend later.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test:run
```

## Quality

This frontend already includes:

- ESLint setup
- Vitest setup
- tests for key stores/clients/contexts
- error boundary support
- tracking/reporting abstraction
- accessibility work on custom UI components

## Backend Integration

This frontend is designed to be connected to a real backend API.

A backend handoff document is included here:

- [BACKEND_HANDOFF.md](/C:/Users/narci/OneDrive/Documentos/Proyectos%20Info/Proyectos%20U/goodreads/frontend/BACKEND_HANDOFF.md)

That file explains:

- which modules the backend needs to implement
- suggested API endpoints
- expected payloads
- auth, library, reviews, messages, notifications, and settings flows

## Folder Structure

```text
src/
  components/
  context/
  data/
  i18n/
  layouts/
  pages/
  routes/
  services/
  styles/
  types/
```

## Current Status

This project is in a strong frontend pre-production state:

- the product UI is fully navigable
- key flows are already implemented
- the mock API layer can be replaced with real HTTP clients

The main next step is backend integration, not a frontend rewrite.
