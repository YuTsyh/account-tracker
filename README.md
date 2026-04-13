# Account Tracker

A personal finance and group expense tracking app built with Vue 3 + Go. Works offline-first as a PWA, with optional cloud sync and native mobile support via Capacitor.

## Features

- **Personal records**: Track your own income and expenses with categories and templates
- **Shared books**: Collaborate with others via 6-digit share codes; split expenses with customizable member splits
- **Offline-first**: All data stored locally in IndexedDB; works without internet
- **Cloud sync**: Optional Google login to sync data across devices
- **Pending sync protection**: Locally-created records are never overwritten by cloud pulls until explicitly pushed
- **Data import**: Import from 小豬記帳本 (.txt) and 天天記帳 (.csv)
- **i18n**: Traditional Chinese and English
- **Mobile**: Build as native iOS/Android app via Capacitor

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`) + TypeScript
- **Pinia** (modular stores) + **Vue Router v5**
- **Tailwind CSS v4**
- **IndexedDB** via `idb` library (offline storage)
- **Capacitor 8** (iOS/Android)
- **Vite** + `vue-tsc`
- Backend: Go + Gin + PostgreSQL — see [`../account-tracker-backend`](../account-tracker-backend)

## Getting Started

### Prerequisites

- Node.js 20+

### Setup

```bash
npm install

# Create .env
echo "VITE_API_URL=http://localhost:8080/api" > .env

npm run dev       # http://localhost:5173
```

### Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview production build
```

### Mobile (Capacitor)

```bash
npm run build
npx cap sync
npx cap open ios      # requires Xcode
npx cap open android  # requires Android Studio
```

## Project Structure

```
src/
├── stores/           # All state (Pinia)
│   ├── tracker.ts    # Root store — composes all submodules
│   ├── books.ts      # Book & RecordItem CRUD + shared book sync
│   ├── personal.ts   # PersonalRecord CRUD
│   ├── categories.ts # Custom category CRUD
│   ├── templates.ts  # RecordTemplate CRUD
│   ├── cloud-sync.ts # Cloud push/pull/merge logic
│   ├── user.ts       # User profile & auth actions
│   ├── storage.ts    # IndexedDB helpers + STORAGE_KEYS
│   └── types.ts      # All TypeScript interfaces
├── utils/
│   ├── api.ts        # Axios instance + API functions
│   ├── piggyImport.ts
│   └── everydayImport.ts
├── views/            # Login, Home, Books, Statistics, Profile
├── components/       # Modals, sheets, calculator keyboard, etc.
└── locales/          # en.ts, zh-TW.ts
```

See [`CLAUDE.md`](CLAUDE.md) for full architectural details.

## Environment

```env
VITE_API_URL=http://localhost:8080/api
```

## License

MIT
