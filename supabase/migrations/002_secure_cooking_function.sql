-- The cooking workflow must write history without granting clients a general
-- INSERT policy. The function owns that narrow privilege boundary; every
-- inventory query remains explicitly scoped to auth.uid().
alter function public.cook_recipe(uuid, integer) security definer;
alter function public.cook_recipe(uuid, integer) set search_path = public;
revoke all on function public.cook_recipe(uuid, integer) from public;
grant execute on function public.cook_recipe(uuid, integer) to authenticated;
