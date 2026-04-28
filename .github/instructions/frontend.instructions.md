---
applyTo: "src/**"
---

## Frontend Conventions (src/)

- State is local (useState/useMemo/useCallback). No global store.
- Types live in `src/types/index.ts`; enums in `src/enums/Enums.ts`. Import from there, do not redefine.
- API calls: `useApi<T>` for reads, `apiPost/apiPut/apiDelete` for mutations (all from `src/hooks/useApi.ts`).
- After any mutation, call the `refetch` callback from the parent `useApi` hook.
- Styling: Tailwind only — no custom CSS classes except in `src/styles/main.css` for global resets.
- New pages: add a `src/pages/XxxPage.tsx` that handles data fetching, then pass data to a `src/components/Xxx.tsx` for presentation.
- New sidebar links: add to the `links` array in `src/components/Sidebar.tsx` with a FontAwesome icon.
- Use `<ComingSoon title="..." />` for unimplemented routes until the feature is built.
- `Pagination<T>` and `QuickSearch<T>` are generic reusable components — prefer them over custom list/search implementations.
