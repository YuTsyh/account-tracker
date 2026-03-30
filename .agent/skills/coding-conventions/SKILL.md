---
name: Frontend Coding Conventions (Vue 3 + TypeScript + Tailwind v4)
description: Professional design standards for the Vue 3 frontend — covering component architecture, decoupling, HTML semantics, CSS readability, and accessibility.
---

# Frontend Coding Conventions

These rules are **MANDATORY** for every change to this Vue 3 + TypeScript + Tailwind v4 codebase. Violations are unacceptable.

---

## 1. Component Architecture — Low Coupling, High Cohesion

### 1.1 Single Responsibility Principle (SRP)
- Each `.vue` file does **ONE thing**. If a component exceeds ~200 lines, consider extracting sub-components or composables.
- Views (`src/views/`) orchestrate layout & data fetching. Components (`src/components/`) handle UI rendering & interaction.

### 1.2 Props Down, Events Up — No Shortcuts
- Parent → Child communication: **props only** (with strict TypeScript types).
- Child → Parent communication: **emit only** (using typed `defineEmits`).
- **NEVER** mutate props directly. Use `defineModel()` or explicit `update:xxx` events.
- **NEVER** rely on `$parent`, `$root`, or `getCurrentInstance()` for cross-component data — that is tight coupling.

### 1.3 Composables for Shared Logic
- Place reusable stateful logic in `src/composables/` as `useXxx()` functions.
- Composables must be **pure functions of their arguments** — no implicit globals. Accept dependencies via parameters.
- Avoid putting business logic directly inside `<script setup>` blocks — delegate to composables or utility functions in `src/utils/`.

### 1.4 State Management (Pinia)
- Stores live in `src/stores/`. One store per domain concern (e.g., `useRecordStore`, `useAuthStore`).
- **NEVER** import a store inside a base component (`Base*.vue`). Base components must be store-agnostic.
- Actions handle async/side-effects. Getters handle derived state. Never put async logic in getters.

---

## 2. TypeScript — Strict Types (No `any`)

### 2.1 Type Declarations
- Define **interfaces** for data shapes: props, API responses, store state.
- Use `as const` for literal unions instead of bare strings.
- **FORBIDDEN types**: `any`, `object`, `Function`, `{}`. Use specific types or `unknown` with type guards.

### 2.2 Props & Emits
```typescript
// ✅ Correct: strongly typed props & emits
interface Props {
  variant: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
```

### 2.3 Null Safety
- Prefer nullish coalescing (`??`) over logical OR (`||`) for default values.
- Use optional chaining (`?.`) but never chain more than 3 levels — extract intermediate variables for readability.

---

## 3. Template / HTML — Semantic & Accessible

### 3.1 Semantic HTML
- Use `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>` instead of generic `<div>` soup.
- Use `<button>` for clickable actions, `<a>` for navigation links. **NEVER** put `@click` on a `<div>` or `<span>`.
- Form elements **MUST** have associated `<label>` or `aria-label`.

### 3.2 Template Readability
- Max **ONE** `v-if/v-else` chain per template level. If you need more complex branching, extract to a computed or sub-component.
- List rendering: always provide a unique `:key` (never use array index for keys in mutable lists).
- Keep templates **flat**: avoid nesting beyond 5 levels of indentation. Extract sub-components to reduce depth.

### 3.3 Attribute Order (enforced)
Follow this consistent ordering on every element:
1. `is` / `v-is`
2. `v-for`, `v-if`, `v-else-if`, `v-else`, `v-show`, `v-cloak`
3. `ref`, `id`
4. `v-model`
5. Class & style: `:class`, `:style`
6. Other bindings: `:prop="value"`
7. Events: `@click`, `@input`, etc.
8. `v-html`, `v-text`

---

## 4. CSS / Tailwind — Readable & Maintainable

### 4.1 Tailwind Class Organization
When Tailwind classes exceed a single line, group them **semantically** with line breaks:
```html
<!-- ✅ Correct: grouped by concern, easy to scan -->
<div
  :class="[
    'flex items-center justify-between',           /* layout */
    'rounded-xl px-4 py-3',                        /* spacing & shape */
    'bg-white shadow-md',                          /* surface */
    'text-sm font-medium text-gray-800',           /* typography */
    'transition-all duration-200 hover:shadow-lg',  /* animation */
  ]"
>
```

### 4.2 Avoid Class Explosion
- If an element has **more than 8 Tailwind classes**, extract the styles to `style.css` using `@apply` or a scoped CSS class — readability takes priority.
- Repeated class combinations across multiple components should become a **Base component** (e.g., `BaseButton.vue`, `BaseCard.vue`) rather than copy-pasted class strings.

### 4.3 Scoped CSS Rules
- Use `<style scoped>` for component-specific styles.
- **NEVER** write unscoped styles (global leakage) unless intentionally in `src/style.css`.
- Use CSS custom properties (variables) for theme tokens (colors, spacing, radii) when Tailwind's config alone isn't sufficient.

### 4.4 Naming Conventions for Custom CSS Classes
- Use **kebab-case**: `.record-card`, `.month-selector-header`.
- Prefix component-scoped classes with the component name to avoid collisions: `.calculator-key`, `.fab-container`.

### 4.5 Animation & Transitions
- Prefer Tailwind's transition utilities for simple hover/active states.
- For complex multi-step animations, use `@keyframes` in `tailwind.config.js` or scoped `<style>`. Keep animation duration ≤ 300ms for perceived snappiness.
- Always add `will-change` or `transform: translateZ(0)` on heavily animated elements to trigger hardware acceleration.

---

## 5. Icons

- **MANDATORY**: All icons MUST come from [Google Fonts Material Symbols](https://fonts.google.com/icons).
- Use the `<span class="material-symbols-outlined">icon_name</span>` pattern.
- **DO NOT** use `@heroicons/vue`, Font Awesome, or any other icon library (note: `@heroicons/vue` exists in `package.json` as legacy — do not introduce new usage).

---

## 6. i18n — Internationalization

- All user-visible strings **MUST** go through `vue-i18n` using `$t('key')` or `t('key')` from `useI18n()`.
- Locale files live in `src/locales/`. One JSON file per language.
- **NEVER** hardcode Chinese/English text directly in templates.

---

## 7. File & Naming Conventions

| Concern | Convention | Example |
|---|---|---|
| Components | PascalCase `.vue` | `BaseBottomSheet.vue` |
| Views (pages) | PascalCase `.vue` | `AddRecord.vue` |
| Composables | camelCase `useXxx.ts` | `useToast.ts` |
| Stores | camelCase `xxx.ts` | `records.ts` |
| Utils | camelCase `.ts` | `formatCurrency.ts` |
| CSS classes | kebab-case | `.summary-bar` |
| Events | camelCase | `@updateRecord` |
| Props | camelCase | `:isVisible` |

---

## 8. Performance & Best Practices

- Use `v-memo` for expensive static list rendering.
- Lazy-load routes with `() => import(...)` in the router.
- Images: use WebP format and include `loading="lazy"` and `width`/`height` attributes.
- Avoid `v-html` unless absolutely necessary (XSS risk). Sanitize any user content.
