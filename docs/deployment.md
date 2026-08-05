# Deployment guide

Current production deployment: `https://smart-fridge-bay.vercel.app`

## Supabase

1. Create a project and apply the migration, then seed reference data.
2. In Authentication → URL Configuration, set the production Site URL to the Vercel URL.
3. Add `https://your-domain.example/auth/callback` and any Vercel preview callback patterns you intentionally support.
4. Configure a production SMTP provider, then enable email confirmation and verify the email template redirects to `/auth/callback`. Development confirmation is disabled because the demo has no SMTP provider.
5. Confirm RLS is enabled and use two test accounts to rerun TC-12.

## Vercel

1. Import the Git repository with framework preset Next.js.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Preview and Production.
3. Do not add the service-role key.
4. Deploy, test sign-up/callback/login/logout, and confirm the route proxy redirects an anonymous `/inventory` request.
5. Run the scenario checklist against production.

There are no localhost-only API endpoints. Error messages are user-safe, and the build has no secret-dependent static fetches.
