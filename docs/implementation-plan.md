# Smart Fridge implementation plan

## 1. Short implementation plan

1. Scaffold a Next.js App Router application with TypeScript, Tailwind CSS, Vitest, React Testing Library, Zod, date-fns, and Supabase SSR clients.
2. Define the PostgreSQL schema, RLS policies, seed/reference data, and a transactional `cook_recipe` database function.
3. Build pure, independently tested business modules for allergies, dietary rules, expiry, matching, missing ingredients, ranking, shopping lists, and inventory deduction.
4. Implement authentication and middleware route protection, followed by profile/allergy setup and inventory CRUD.
5. Implement recipe recommendations, details, shopping-list actions, atomic cooking confirmation, and history.
6. Assemble the dashboard, responsive navigation, polished public pages, and presenter-oriented demo scenarios.
7. Finish unit/component coverage and project documentation; run lint, typecheck, tests, and a production build.

Each phase is considered complete only after its directly affected validation and tests pass. The UI remains a consumer of domain modules rather than owning business rules.

## 2. Proposed file structure

```text
app/
  (auth)/login, signup
  (app)/dashboard, profile, inventory, recipes, shopping-list, history, demo-scenarios
  auth/callback, api/*
  globals.css, layout.tsx, page.tsx
components/
  auth/, dashboard/, inventory/, profile/, recipes/, ui/
lib/
  business/             # pure rules and calculations
  data/                 # repositories and demo adapters
  supabase/             # browser/server clients and middleware
  schemas/              # Zod input schemas
  types.ts, utils.ts
supabase/
  migrations/001_initial_schema.sql
  seed.sql
tests/
  business/, components/
docs/
  implementation-plan.md, architecture.md, database-design.md,
  business-rules.md, test-cases.md, ai-collaboration-log.md, deployment.md
middleware.ts
```

## 3. Required database schema

| Table                 | Purpose                                    | Ownership / key constraints                                          |
| --------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| `profiles`            | User preferences and setup state           | PK/FK `id -> auth.users`; one row per user                           |
| `allergies`           | Normalised reference list                  | Unique normalised name; authenticated read                           |
| `user_allergies`      | User-to-allergy relation and custom labels | User-owned; unique `(user_id, allergy_id)` or normalised custom name |
| `ingredients`         | Ingredient catalogue and expiry rule key   | Unique normalised name; authenticated read                           |
| `user_inventory`      | Quantities, storage, and expiry            | User-owned; quantity > 0; expiry >= added date                       |
| `recipes`             | Recipe metadata and instructions           | Authenticated read                                                   |
| `recipe_ingredients`  | Required/optional recipe quantities        | Unique `(recipe_id, ingredient_id)`; quantity > 0                    |
| `shopping_list_items` | Manual and recipe-derived shopping needs   | User-owned; quantity > 0                                             |
| `cooking_history`     | Immutable cooking audit                    | User-owned; positive servings; JSON deduction summary                |

All user-owned tables have RLS policies bound to `auth.uid()`. Reference tables are read-only to authenticated users. Cooking uses one `security invoker` PostgreSQL function that locks inventory rows, validates every required quantity, performs all deductions/deletions, and writes history in the same transaction.

## 4. Risks and assumptions

- **Supabase availability:** A reviewer may open the app without environment variables. The app will include an explicit demo mode backed by seeded in-browser data so every flow remains presentable; configured Supabase becomes the durable production backend.
- **Seed demo identity:** Supabase migrations cannot safely create an Auth password without privileged deployment tooling. `seed.sql` seeds reference data; the README documents creating `alex@smartfridge.demo`, after which a trigger creates Alex's profile. Demo mode supplies Alex immediately.
- **Units:** The first version requires recipe and inventory units to match. Automatic mass/volume conversion is out of scope and documented.
- **Expiry estimation:** Estimates are conservative configuration values, not food-safety advice. They are visibly labelled and never override a user-entered date.
- **Allergen model:** Recipe exclusion is ingredient/allergen tag based, not a medical guarantee or cross-contamination detector.
- **Presence matching vs cooking:** Recommendation percentage is presence-only as required; cooking validation is quantity-aware.
- **Custom ingredients:** The production schema uses the catalogue to preserve ID-based matching. Users can add a catalogue item through a controlled server path; the demo uses the seeded catalogue.
- **Images:** The demo uses CSS/emoji ingredient artwork to avoid external image availability, licensing, and remote-host configuration risks.
