---
name: composables
description: "Skill for the Composables area of account-tracker. 6 symbols across 2 files."
---

# Composables

6 symbols | 2 files | Cohesion: 83%

## When to Use

- Working with code in `src/`
- Understanding how syncToCloud, overwriteFromCloud, show work
- Modifying composables-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/composables/useToast.ts` | show, success, error, info |
| `src/stores/cloud-sync.ts` | syncToCloud, overwriteFromCloud |

## Entry Points

Start here when exploring this area:

- **`syncToCloud`** (Function) — `src/stores/cloud-sync.ts:20`
- **`overwriteFromCloud`** (Function) — `src/stores/cloud-sync.ts:37`
- **`show`** (Function) — `src/composables/useToast.ts:17`
- **`success`** (Function) — `src/composables/useToast.ts:25`
- **`error`** (Function) — `src/composables/useToast.ts:26`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `syncToCloud` | Function | `src/stores/cloud-sync.ts` | 20 |
| `overwriteFromCloud` | Function | `src/stores/cloud-sync.ts` | 37 |
| `show` | Function | `src/composables/useToast.ts` | 17 |
| `success` | Function | `src/composables/useToast.ts` | 25 |
| `error` | Function | `src/composables/useToast.ts` | 26 |
| `info` | Function | `src/composables/useToast.ts` | 27 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `ImportMyShareFromBook → Show` | cross_community | 3 |
| `OverwriteFromCloud → SaveToStorage` | cross_community | 3 |
| `OverwriteFromCloud → Show` | intra_community | 3 |
| `SyncToCloud → Show` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Stores | 1 calls |

## How to Explore

1. `gitnexus_context({name: "syncToCloud"})` — see callers and callees
2. `gitnexus_query({query: "composables"})` — find related execution flows
3. Read key files listed above for implementation details
