create extension if not exists pgcrypto;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null check (
    category in (
      'Podcasts',
      'Culture G',
      'Geopolitique',
      'Economie',
      'Histoire',
      'Concepts',
      'Citations',
      'Revisions'
    )
  ),
  subcategory text not null default '',
  summary text not null default '',
  key_idea text not null default '',
  content text not null default '',
  example text not null default '',
  source text not null default '',
  tags text[] not null default '{}',
  importance text not null default 'moyen' check (importance in ('faible', 'moyen', 'eleve')),
  status text not null default 'a_apprendre' check (status in ('a_apprendre', 'en_cours', 'maitrise')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.planner_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  details text not null default '',
  item_type text not null default 'tache' check (item_type in ('tache', 'rendez_vous', 'revision', 'objectif')),
  status text not null default 'planifie' check (status in ('planifie', 'termine')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_category_idx on public.notes (category);
create index if not exists notes_status_idx on public.notes (status);
create index if not exists notes_importance_idx on public.notes (importance);
create index if not exists planner_items_user_id_idx on public.planner_items (user_id);
create index if not exists planner_items_starts_at_idx on public.planner_items (starts_at);
create index if not exists planner_items_status_idx on public.planner_items (status);
create index if not exists planner_items_type_idx on public.planner_items (item_type);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
drop trigger if exists planner_items_set_updated_at on public.planner_items;

create trigger notes_set_updated_at
before update on public.notes
for each row
execute function public.handle_updated_at();

create trigger planner_items_set_updated_at
before update on public.planner_items
for each row
execute function public.handle_updated_at();

alter table public.notes enable row level security;
alter table public.planner_items enable row level security;

drop policy if exists "Users can view their own notes" on public.notes;
create policy "Users can view their own notes"
on public.notes
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own notes" on public.notes;
create policy "Users can insert their own notes"
on public.notes
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notes" on public.notes;
create policy "Users can update their own notes"
on public.notes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own notes" on public.notes;
create policy "Users can delete their own notes"
on public.notes
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view their own planner items" on public.planner_items;
create policy "Users can view their own planner items"
on public.planner_items
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own planner items" on public.planner_items;
create policy "Users can insert their own planner items"
on public.planner_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own planner items" on public.planner_items;
create policy "Users can update their own planner items"
on public.planner_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own planner items" on public.planner_items;
create policy "Users can delete their own planner items"
on public.planner_items
for delete
using (auth.uid() = user_id);
