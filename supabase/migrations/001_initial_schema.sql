-- Smart Fridge initial schema. Apply in Supabase SQL Editor or via `supabase db push`.
create extension if not exists pgcrypto;

create type public.dietary_preference as enum ('No restriction','Vegetarian','Vegan','Pescatarian','Halal','Other');
create type public.storage_location as enum ('Refrigerator','Freezer','Pantry');
create type public.expiry_source as enum ('entered','estimated');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  dietary_preference public.dietary_preference not null default 'No restriction',
  health_goal text not null default 'No specific goal', religious_restriction text,
  setup_completed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.allergies (
  id uuid primary key default gen_random_uuid(), name text not null,
  normalized_name text generated always as (lower(trim(name))) stored unique,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_allergies (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  allergy_id uuid references public.allergies(id) on delete cascade, custom_name text,
  normalized_custom_name text generated always as (lower(trim(custom_name))) stored,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint allergy_source check ((allergy_id is not null) <> (custom_name is not null)),
  constraint custom_allergy_not_blank check (custom_name is null or char_length(trim(custom_name)) > 0),
  unique(user_id, allergy_id), unique(user_id, normalized_custom_name)
);
create table public.ingredients (
  id uuid primary key default gen_random_uuid(), name text not null,
  normalized_name text generated always as (lower(trim(name))) stored unique, category text not null,
  allergen_ids uuid[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_inventory (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  quantity numeric(12,3) not null check (quantity > 0), unit text not null check (unit in ('g','kg','ml','L','pieces','packs','cans')),
  storage_location public.storage_location not null, added_date date not null, expiry_date date not null,
  expiry_source public.expiry_source not null default 'entered', notes text check (char_length(notes) <= 300),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint valid_expiry check (expiry_date >= added_date)
);
create index inventory_user_expiry_idx on public.user_inventory(user_id, expiry_date);
create index inventory_user_ingredient_idx on public.user_inventory(user_id, ingredient_id);
create table public.recipes (
  id uuid primary key default gen_random_uuid(), name text not null unique, description text not null, instructions jsonb not null,
  preparation_time integer not null check (preparation_time > 0), difficulty text not null check (difficulty in ('Easy','Medium')),
  default_servings integer not null check (default_servings > 0), dietary_category public.dietary_preference not null,
  image_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(), recipe_id uuid not null references public.recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  required_quantity numeric(12,3) not null check (required_quantity > 0), unit text not null check (unit in ('g','kg','ml','L','pieces','packs','cans')),
  is_optional boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(recipe_id, ingredient_id)
);
create index recipe_ingredients_recipe_idx on public.recipe_ingredients(recipe_id);
create table public.shopping_list_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete set null, ingredient_name text,
  quantity numeric(12,3) not null check (quantity > 0), unit text not null check (unit in ('g','kg','ml','L','pieces','packs','cans')),
  related_recipe_id uuid references public.recipes(id) on delete set null, is_purchased boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint shopping_item_name check (ingredient_id is not null or char_length(trim(ingredient_name)) > 0)
);
create index shopping_user_idx on public.shopping_list_items(user_id, is_purchased);
create table public.cooking_history (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete restrict, cooked_at timestamptz not null default now(),
  servings_prepared integer not null check (servings_prepared > 0), deducted_inventory_summary jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index history_user_cooked_idx on public.cooking_history(user_id, cooked_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['profiles','allergies','user_allergies','ingredients','user_inventory','recipes','recipe_ingredients','shopping_list_items','cooking_history'] loop execute format('create trigger set_%s_updated_at before update on public.%I for each row execute function public.set_updated_at()',t,t); end loop; end $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,display_name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'display_name',''),split_part(new.email,'@',1))); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security; alter table public.user_allergies enable row level security;
alter table public.user_inventory enable row level security; alter table public.shopping_list_items enable row level security; alter table public.cooking_history enable row level security;
alter table public.allergies enable row level security; alter table public.ingredients enable row level security; alter table public.recipes enable row level security; alter table public.recipe_ingredients enable row level security;
create policy profiles_owner_all on public.profiles for all using (id=auth.uid()) with check (id=auth.uid());
create policy user_allergies_owner_all on public.user_allergies for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy inventory_owner_all on public.user_inventory for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy shopping_owner_all on public.shopping_list_items for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy history_owner_select on public.cooking_history for select using (user_id=auth.uid());
create policy reference_allergies_read on public.allergies for select to authenticated using (true);
create policy reference_ingredients_read on public.ingredients for select to authenticated using (true);
create policy reference_recipes_read on public.recipes for select to authenticated using (true);
create policy reference_recipe_ingredients_read on public.recipe_ingredients for select to authenticated using (true);

-- Atomic, quantity-aware cooking. Unit conversion is deliberately out of scope.
create or replace function public.cook_recipe(p_recipe_id uuid,p_servings integer)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare v_default integer; v_req record; v_needed numeric; v_available numeric; v_row record; v_take numeric; v_remaining numeric; v_summary jsonb='{}'; v_shortages jsonb='[]';
begin
  if p_servings<=0 then raise exception 'Servings must be positive'; end if;
  select default_servings into v_default from recipes where id=p_recipe_id;
  if v_default is null then raise exception 'Recipe not found'; end if;
  -- Lock every potentially affected row before validating, preventing concurrent overspend.
  perform 1 from user_inventory ui join recipe_ingredients ri on ri.ingredient_id=ui.ingredient_id and ri.unit=ui.unit where ui.user_id=auth.uid() and ri.recipe_id=p_recipe_id for update of ui;
  for v_req in select ri.*,i.name from recipe_ingredients ri join ingredients i on i.id=ri.ingredient_id where ri.recipe_id=p_recipe_id and not ri.is_optional loop
    v_needed:=v_req.required_quantity*p_servings/v_default;
    select coalesce(sum(quantity),0) into v_available from user_inventory where user_id=auth.uid() and ingredient_id=v_req.ingredient_id and unit=v_req.unit and expiry_date>=current_date;
    if v_available<v_needed then v_shortages:=v_shortages||jsonb_build_array(jsonb_build_object('name',v_req.name,'needed',v_needed,'available',v_available,'unit',v_req.unit)); end if;
  end loop;
  if jsonb_array_length(v_shortages)>0 then return jsonb_build_object('ok',false,'insufficient',v_shortages); end if;
  for v_req in select * from recipe_ingredients where recipe_id=p_recipe_id and not is_optional loop
    v_remaining:=v_req.required_quantity*p_servings/v_default; v_summary:=v_summary||jsonb_build_object(v_req.ingredient_id,v_remaining);
    for v_row in select id,quantity from user_inventory where user_id=auth.uid() and ingredient_id=v_req.ingredient_id and unit=v_req.unit and expiry_date>=current_date order by expiry_date,id for update loop
      v_take:=least(v_row.quantity,v_remaining);
      if v_row.quantity=v_take then delete from user_inventory where id=v_row.id; else update user_inventory set quantity=quantity-v_take where id=v_row.id; end if;
      v_remaining:=v_remaining-v_take; exit when v_remaining=0;
    end loop;
  end loop;
  insert into cooking_history(user_id,recipe_id,servings_prepared,deducted_inventory_summary) values(auth.uid(),p_recipe_id,p_servings,v_summary);
  return jsonb_build_object('ok',true,'deducted',v_summary);
end $$;
revoke all on function public.cook_recipe(uuid,integer) from public; grant execute on function public.cook_recipe(uuid,integer) to authenticated;
