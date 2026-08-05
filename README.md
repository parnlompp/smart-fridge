# Smart Fridge

Smart Fridge is a production-structured university demo that helps a household track food, prioritise expiring ingredients, find allergy-aware recipes, shop for missing items, and deduct stock safely after cooking.

## Problem and objectives

Households often lose track of what they own and when it expires. The project makes inventory freshness visible and turns it into practical recipe suggestions. Its objectives are correct and explainable recommendation logic, safe preference filtering, atomic stock deduction, strong per-user data isolation, and a polished assessment-ready demo.

## Scope

Included: authentication contracts, protected-route proxy, profile/allergy preferences, inventory CRUD, expiry estimation, dashboard alerts, recipe filtering/matching/ranking, shopping list, transactional cooking history, RLS, automated domain tests, and presenter scenarios.

Not included: barcode scanning, nutrition/medical advice, cross-contamination guarantees, unit conversion, shared households, live notifications, or third-party recipe APIs.

## Technology

Next.js App Router, React, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL/RLS, Zod, date-fns, Vitest, React Testing Library, and Tabler icons. The app is Vercel compatible.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. If Supabase variables are omitted, **Start demo** opens a local, seeded Alex experience. Local demo changes stay in browser storage and can be reset from Demo Scenarios.

## Environment variables

| Name | Required in production | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anonymous key; safe for browser use with RLS |

Never expose a service-role key to this application.

## Database setup

### Local Supabase

Docker Desktop is required by the Supabase local stack.

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:status
```

Copy the API URL and publishable/anonymous key printed by `supabase:status` into `.env.local`, then restart Next.js. Local Studio runs at `http://127.0.0.1:54323`.

### Hosted Supabase

1. Create a Supabase project and authenticate the CLI with `npx supabase login`.
2. Run `npm run supabase:link -- --project-ref YOUR_PROJECT_REF`.
3. Run `npm run supabase:push`, then execute `supabase/seed.sql` through the SQL editor or `supabase db reset` in a disposable environment.
4. Copy the project URL and publishable/anonymous key to `.env.local`.
5. Create a development Auth user for Alex, then add profile/allergy/inventory rows using its generated UUID.
6. Configure Auth URL settings as described in `docs/deployment.md`.

## Quality commands

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Deployment

Import the repository into Vercel, add both public Supabase variables, deploy, and add the resulting Vercel domain to Supabase Site URL and Redirect URLs. See `docs/deployment.md` for the checklist.

## Known limitations

- Demo mode uses localStorage; Supabase is the intended durable backend.
- Inventory and recipe units must match exactly.
- Expiry rules are conservative planning estimates, not food-safety advice.
- Allergen tags cannot account for manufacturing cross-contamination.
- The portable SQL seed creates references; Auth-linked Alex rows require the deployment-specific user UUID.

The design rationale, data model, rules, test evidence, and AI working record are in [`docs/`](docs/).
