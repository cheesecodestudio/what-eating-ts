---
applyTo: "server/**"
---

## Backend Conventions (server/)

- Runtime: Node.js with `ts-node-dev` in dev, compiled to `dist/` in prod.
- Module system: CommonJS (`"type": "commonjs"` in `server/package.json`). Use `require`/`module.exports` only if needed; TypeScript `import/export` compiles correctly.
- DB access exclusively via `server/src/db.ts` which exports the `supabase` client.
- Use `generateId(prefix)` and `today()` from `server/src/utils.ts` — never `uuid` or raw `Date`.
- Validate all user inputs at the route level before hitting Supabase; return `400` with `{ error: string }` on bad input.
- Return `404` when Supabase returns no rows on targeted queries (check `data.length === 0`).
- All error responses must be `{ error: string }` JSON.
- When adding a new route file, mount it in `server/src/index.ts` with `app.use('/api/<resource>', router)`.
