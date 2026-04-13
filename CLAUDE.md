# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Frontend**: Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS v4
- **Routing**: Vue Router v5
- **Storage**: IndexedDB via `idb` (offline-first)
- **HTTP**: Axios (`src/utils/api.ts`)
- **Mobile**: Capacitor 8 (iOS/Android wrapper)
- **i18n**: vue-i18n, locales at `src/locales/en.ts` & `zh-TW.ts`
- **Backend**: Go + Gin + PostgreSQL (Neon DB), repo: `../account-tracker-backend`
- **Deploy**: Vercel (frontend static, backend serverless via `api/index.go`)

## Commands

```bash
npm run dev       # dev server (localhost:5173)
npm run build     # vue-tsc + vite build
npm run preview   # preview build
```

Backend (in `../account-tracker-backend`):
```bash
go run main.go                    # local server (port 8080)
GIN_MODE=release go run main.go
```

## File Map

```
src/
├── stores/
│   ├── types.ts          # All interfaces: Book, RecordItem, PersonalRecord, Category, RecordTemplate, UserProfile
│   ├── constants.ts      # defaultCategories[]
│   ├── storage.ts        # IndexedDB helpers (loadFromStorage/saveToStorage) + STORAGE_KEYS
│   ├── tracker.ts        # Root Pinia store — composes all submodules, owns all state refs
│   ├── books.ts          # Book/RecordItem CRUD + shared book sync (pullSharedBook/syncSharedBook)
│   ├── personal.ts       # PersonalRecord CRUD
│   ├── categories.ts     # Custom category CRUD (default categories are in constants.ts)
│   ├── templates.ts      # RecordTemplate CRUD
│   ├── user.ts           # User profile actions (login, theme, animations)
│   └── cloud-sync.ts     # Cloud push/pull/merge logic (see Sync section below)
├── utils/
│   ├── api.ts            # Axios instance + all API call functions
│   ├── piggyImport.ts    # Parser for 小豬記帳本 .txt backup
│   └── everydayImport.ts # Parser for 天天記帳 .csv backup
├── views/
│   ├── Login.vue         # Google OAuth callback handler + restore-from-cloud prompt
│   ├── Profile.vue       # Settings, cloud sync buttons, UUID backup/restore
│   ├── Home.vue          # Personal records tab
│   ├── Books.vue         # Shared books tab
│   └── Statistics.vue    # Spending charts
├── components/           # UI components (modals, sheets, calculator keyboard, etc.)
├── locales/              # en.ts, zh-TW.ts — add new keys to BOTH files
└── i18n.ts               # vue-i18n setup
```

## Data Models (key fields only)

```typescript
Book            { id, name, members[], createdAt, shareCode?, isSynced? }
Member          { id, name, userId? }  // userId links member to a UserProfile
RecordItem      { id, bookId, type, amount, category, date, note, paidById, splitAmongIds[], splitCustomAmounts?, isSynced? }
PersonalRecord  { id, type, amount, category, date, note, sourceBookId?, isSynced? }
Category        { id, name, type, icon, color, isDefault, isSynced? }
RecordTemplate  { id, name, type, amount, category, note, isSynced? }
UserProfile     { id, name, avatar?, email?, theme, animations, isLoggedIn, authToken? }
```

`isSynced?: boolean` — `undefined`/`false` = not yet pushed to cloud; `true` = in sync with cloud.

## Sync Architecture

Two separate sync paths:

### 1. Main Cloud Sync (`/api/sync/push` & `/api/sync/pull`)
- Auth: Google JWT required
- Push = full replace on backend (DELETE all → INSERT all)
- Endpoints: `POST /api/sync/push`, `GET /api/sync/pull`
- Triggered manually from Profile.vue (`syncToCloud`, `overwriteFromCloud`)
- On success: all entities marked `isSynced=true`, all tombstones cleared

### 2. Shared Book Sync (`/api/shared/{code}`)
- No auth required, identified by 6-char share code
- Per-book: `updateSharedBook` (push), `fetchSharedBook` (pull)
- Auto-triggered: every `addRecord`/`updateRecord`/`deleteRecord` (debounced 300ms)
- Auto-pulled: on `selectBook` / `watch(currentBookId)`

### 3. UUID Backup (`/api/sync/push-uuid`, `/api/sync/pull-uuid/{uuid}`)
- No auth required, identified by user's local UUID
- Used for anonymous users and as fallback backup

## Pending Sync & Tombstone System

Protects locally-created/modified data from being overwritten by cloud pulls.

### `isSynced` flag
Set to `false` on: `addRecord`, `updateRecord`, `createBook`, `updateBook`, `addMemberToBook`, `addPersonalRecord`, `updatePersonalRecord`, `addCustomCategory`, `addTemplate`, `updateTemplate`, `importPersonalRecords`

Set to `true` on: successful `syncToCloud`, successful `backupByUUID`, items received via `applyCloudData`

### Tombstone arrays (stored in IndexedDB)
```
pendingDeleteRecordIds[]          // STORAGE_KEYS.PENDING_DELETE_RECORDS
pendingDeletePersonalRecordIds[]  // STORAGE_KEYS.PENDING_DELETE_PERSONAL_RECORDS
pendingDeleteBookIds[]            // STORAGE_KEYS.PENDING_DELETE_BOOKS
pendingDeleteCustomCategoryIds[]  // STORAGE_KEYS.PENDING_DELETE_CUSTOM_CATEGORIES
pendingDeleteTemplateIds[]        // STORAGE_KEYS.PENDING_DELETE_TEMPLATES
```
Added to on: every `delete*()` call (regardless of `isSynced` state)
Cleared on: successful `syncToCloud` or `backupByUUID`

### `applyCloudData` merge logic (in `cloud-sync.ts`)
For each entity type:
1. Filter cloud items that are in tombstone → excluded
2. Local pending (`isSynced=false`) overrides same-ID cloud item
3. Local pending items not in cloud → preserved as-is
4. Everything from cloud → `isSynced=true`

### `overwriteFromCloud` / `restoreByUUID`
Explicit user action = full overwrite. Shows `sync.confirmOverwriteWithPending` warning if `countPending() > 0`.

## Google OAuth Flow

```
User clicks Google Login
→ redirect to GET /api/auth/google/login
→ Google redirects to GET /api/auth/google/callback
→ backend redirects to frontend /?token=...&name=...&id=...&email=...&avatar=...
→ Login.vue onMounted detects query params
→ calls store.loginGoogle() to save profile
→ calls pullSyncData() to check for existing cloud data
→ if cloud has data: shows restore prompt (applyCloudData = smart merge, NOT full overwrite)
→ if no cloud data: redirect to /dashboard
```

## Storage Keys (IndexedDB)

All defined in `STORAGE_KEYS` in `storage.ts`:
`tracker_books`, `tracker_records_v2`, `tracker_current_book`, `tracker_personal_records`,
`tracker_user_profile`, `tracker_custom_categories`, `tracker_deleted_categories`, `tracker_templates`,
`tracker_pending_delete_records`, `tracker_pending_delete_personal_records`,
`tracker_pending_delete_books`, `tracker_pending_delete_custom_categories`, `tracker_pending_delete_templates`

`tracker_deleted_categories` = hides default categories locally (different from tombstone system)

## Environment

```
VITE_API_URL=http://localhost:8080/api   # backend base URL
```

Backend `.env`:
```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
JWT_SECRET
FRONTEND_URL
PORT=8080
```

## Key Patterns

- **`tracker.ts` is the only store** — all submodules (`setupBookActions`, etc.) are functions that receive refs and return actions, composed in `tracker.ts`. Never import submodule setup functions directly in components.
- **`save()`** persists ALL state to IndexedDB atomically (including tombstones). Called after every mutation.
- **`init()`** is idempotent and lazy — only runs once, returns the same promise if called again.
- **Adding i18n keys**: always add to BOTH `en.ts` and `zh-TW.ts`.
- **Shared book records** use the same `RecordItem` type but also sync via shared book API. `isSynced` tracks main cloud sync state only.
- **`deletedCategoryIds`** (existing) hides default built-in categories locally — separate from the tombstone `pendingDeleteCustomCategoryIds` which tracks unsynced custom category deletions.
