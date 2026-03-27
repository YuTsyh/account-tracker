# Account Tracker

Account Tracker is a mobile-first Vue 3 app for personal finance tracking and small-group expense splitting.

It is designed as a local-first PWA, with optional backend integrations for Google login, cloud sync, and shared-book publishing and joining.

## What the app does

- Track personal income and expenses with categories, dates, notes, and quick templates
- Create shared books for trips, roommates, or group events
- Calculate settlements between members
- Switch between Traditional Chinese, English, and Japanese
- Install to mobile or desktop as a PWA
- Use the app offline after the initial load

## Current product shape

The app currently has two operating modes:

1. Local-only mode
   - Works without any backend
   - Stores data in `localStorage`
   - Supports anonymous setup and all core personal/group bookkeeping flows
2. Connected mode
   - Uses backend endpoints for Google auth, cloud backup/restore, and shared-book sync
   - Frontend wiring exists in this repo, backend services do not

This distinction matters. Core bookkeeping works locally. Cloud and auth features require `VITE_API_URL` to point at a compatible backend.

## Tech stack

### Frontend

- Vue 3
- TypeScript
- Pinia
- Vue Router 5
- Vue I18n 11
- Tailwind CSS 4
- Material Symbols

### Tooling

- Vite 7
- `vite-plugin-pwa`
- Capacitor 8

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/YuTsyh/account-tracker.git
cd account-tracker
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:5173`.

### Production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Optional backend configuration

Frontend API calls are defined in [src/utils/api.ts](src/utils/api.ts).

By default the app uses:

```bash
VITE_API_URL=http://localhost:8080/api
```

This is only needed for:

- Google login
- cloud backup / restore
- publishing a shared book
- joining or pulling a shared book from a share code

## App routes

Public routes:

- `/`
- `/login`
- `/privacy`
- `/terms`

App routes after profile setup:

- `/dashboard`
- `/books`
- `/add`
- `/statistics`
- `/profile`

## Project structure

```text
src/
  components/
    books/          Book views, modals, sheets, and settlement UI
    home/           Personal-record sheets and grouped record UI
    statistics/     Charts and category breakdown UI
  composables/      Reusable app logic such as toast helpers
  locales/          zh-TW, en, ja translations
  router/           Vue Router definitions and guards
  stores/           Pinia store composition and feature modules
  utils/            API client and category/date helpers
  views/            Route-level pages
```

The main store entrypoint is [src/stores/tracker.ts](src/stores/tracker.ts). It composes user, categories, books, personal records, templates, and cloud-sync actions into one Pinia store.

## Frontend quality notes

Recent frontend cleanup focused on:

- semantic page landmarks such as `main`, `header`, `section`, and `nav`
- better button, list, form, and dialog semantics
- basic accessibility improvements for menus, sheets, and modals
- keeping UI structure stable while reducing invalid or misleading HTML usage

## PWA and mobile

This repo is set up as a PWA and also includes Capacitor packages for native shell builds.

The Vite PWA config lives in [vite.config.ts](vite.config.ts). The generated app manifest currently uses:

- standalone display mode
- portrait orientation
- icon assets from `public/icon-192.png` and `public/icon-512.png`

## Verification

For frontend changes, the main checks are:

```bash
npm run build
```

And then a manual browser pass with `npm run dev`, especially for:

- landing
- login / anonymous setup
- dashboard
- books
- statistics
- profile

When testing locally, skip cloud and auth flows unless a backend is available.

## License

MIT
