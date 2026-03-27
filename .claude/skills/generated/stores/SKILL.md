---
name: stores
description: "Skill for the Stores area of account-tracker. 32 symbols across 9 files."
---

# Stores

32 symbols | 9 files | Cohesion: 87%

## When to Use

- Working with code in `src/`
- Understanding how loginGoogle, save, addTemplate work
- Modifying stores-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/stores/books.ts` | pullSharedBook, publishBook, joinBookByCode, createBook, selectBook (+8) |
| `src/stores/user.ts` | loginGoogle, setTheme, setAnimations, updateUserProfile, loginAnonymous |
| `src/stores/personal.ts` | updatePersonalRecord, deletePersonalRecord, addPersonalRecord, importMyShareFromBook |
| `src/stores/templates.ts` | addTemplate, updateTemplate, deleteTemplate |
| `src/stores/categories.ts` | addCustomCategory, deleteCustomCategory |
| `src/composables/useToast.ts` | useToast, warning |
| `src/stores/tracker.ts` | save |
| `src/stores/storage.ts` | saveToStorage |
| `src/stores/cloud-sync.ts` | setupCloudSyncActions |

## Entry Points

Start here when exploring this area:

- **`loginGoogle`** (Function) — `src/stores/user.ts:26`
- **`save`** (Function) — `src/stores/tracker.ts:37`
- **`addTemplate`** (Function) — `src/stores/templates.ts:10`
- **`updateTemplate`** (Function) — `src/stores/templates.ts:15`
- **`deleteTemplate`** (Function) — `src/stores/templates.ts:23`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `loginGoogle` | Function | `src/stores/user.ts` | 26 |
| `save` | Function | `src/stores/tracker.ts` | 37 |
| `addTemplate` | Function | `src/stores/templates.ts` | 10 |
| `updateTemplate` | Function | `src/stores/templates.ts` | 15 |
| `deleteTemplate` | Function | `src/stores/templates.ts` | 23 |
| `updatePersonalRecord` | Function | `src/stores/personal.ts` | 20 |
| `deletePersonalRecord` | Function | `src/stores/personal.ts` | 28 |
| `pullSharedBook` | Function | `src/stores/books.ts` | 54 |
| `publishBook` | Function | `src/stores/books.ts` | 74 |
| `joinBookByCode` | Function | `src/stores/books.ts` | 98 |
| `createBook` | Function | `src/stores/books.ts` | 141 |
| `selectBook` | Function | `src/stores/books.ts` | 159 |
| `updateBook` | Function | `src/stores/books.ts` | 164 |
| `deleteBook` | Function | `src/stores/books.ts` | 200 |
| `addMemberToBook` | Function | `src/stores/books.ts` | 209 |
| `addRecord` | Function | `src/stores/books.ts` | 221 |
| `updateRecord` | Function | `src/stores/books.ts` | 232 |
| `deleteRecord` | Function | `src/stores/books.ts` | 242 |
| `setTheme` | Function | `src/stores/user.ts` | 35 |
| `setAnimations` | Function | `src/stores/user.ts` | 40 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `ImportMyShareFromBook → SaveToStorage` | cross_community | 4 |
| `LoginAnonymous → SaveToStorage` | cross_community | 4 |
| `ImportMyShareFromBook → Show` | cross_community | 3 |
| `OverwriteFromCloud → SaveToStorage` | cross_community | 3 |
| `LoginGoogle → SaveToStorage` | cross_community | 3 |
| `AddTemplate → SaveToStorage` | cross_community | 3 |
| `UpdateTemplate → SaveToStorage` | cross_community | 3 |
| `DeleteTemplate → SaveToStorage` | cross_community | 3 |
| `UpdatePersonalRecord → SaveToStorage` | cross_community | 3 |
| `DeletePersonalRecord → SaveToStorage` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Composables | 1 calls |

## How to Explore

1. `gitnexus_context({name: "loginGoogle"})` — see callers and callees
2. `gitnexus_query({query: "stores"})` — find related execution flows
3. Read key files listed above for implementation details
