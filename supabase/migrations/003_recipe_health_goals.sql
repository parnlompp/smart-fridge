alter table public.recipes
add column health_goals text[] not null default '{}';

