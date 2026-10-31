-- CitaClara SETUP TODO EN UNO
-- Supabase SQL Editor → Run once

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  bio text,
  birth_date date not null,
  country text not null check (country in ('MX','US','ES')),
  photo_url text,
  paused_until timestamptz,
  stripe_customer_id text unique,
  created_at timestamptz default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (from_user, to_user),
  check (from_user <> to_user)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.ai_inferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  value text not null,
  source text not null,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('active','canceled','grace','expired')),
  plan text not null check (plan in ('monthly','quarterly')),
  current_period_end timestamptz,
  canceled_at timestamptz,
  stripe_subscription_id text,
  stripe_customer_id text,
  amount_cents int,
  currency text,
  country text,
  started_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event text not null,
  screens_to_cancel int,
  within_refund_window boolean,
  amount_cents int,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (blocker_id, blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz default now()
);

create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.boost_impacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  views int not null default 0,
  likes int not null default 0,
  matches int not null default 0,
  cost_display text not null,
  created_at timestamptz default now()
);

create table if not exists public.push_tokens (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  token text not null,
  updated_at timestamptz default now()
);

create table if not exists public.telemetry_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event text not null,
  properties jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create or replace function public.handle_new_like()
returns trigger language plpgsql security definer as $$
declare a uuid; b uuid;
begin
  if exists (select 1 from public.likes where from_user = new.to_user and to_user = new.from_user) then
    a := least(new.from_user, new.to_user);
    b := greatest(new.from_user, new.to_user);
    insert into public.matches (user_a, user_b) values (a, b) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_handle_new_like on public.likes;
create trigger trg_handle_new_like after insert on public.likes
  for each row execute function public.handle_new_like();

create or replace function public.cancel_my_subscription(screens_used int default 2)
returns void language plpgsql security definer as $$
declare uid uuid := auth.uid(); sub record; within_window boolean;
begin
  if uid is null then raise exception 'No autenticado'; end if;
  if screens_used > 2 then raise exception 'La cancelacion debe completarse en 2 pantallas o menos.'; end if;
  select * into sub from public.subscriptions where user_id = uid and status = 'active' order by created_at desc limit 1;
  if sub is null then raise exception 'No hay suscripcion activa'; end if;
  within_window := (now() - coalesce(sub.started_at, sub.created_at)) < interval '14 days';
  update public.subscriptions set status = 'canceled', canceled_at = now() where id = sub.id;
  insert into public.subscription_events (user_id, event, screens_to_cancel, within_refund_window, amount_cents)
  values (uid, 'canceled', screens_used, within_window, sub.amount_cents);
end;
$$;

create or replace function public.request_account_deletion()
returns void language plpgsql security definer as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'No autenticado'; end if;
  update public.profiles set display_name = 'Usuario eliminado', bio = null, photo_url = null, paused_until = now() where id = uid;
  delete from public.ai_inferences where user_id = uid;
  update public.subscriptions set status = 'canceled', canceled_at = now() where user_id = uid and status = 'active';
end;
$$;

alter table public.profiles enable row level security;
alter table public.likes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_events enable row level security;
alter table public.ai_inferences enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles: public read" on public.profiles;
drop policy if exists "profiles: own insert" on public.profiles;
drop policy if exists "profiles: own update" on public.profiles;
create policy "profiles: public read" on public.profiles for select using (true);
create policy "profiles: own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "likes: own read" on public.likes;
drop policy if exists "likes: own insert" on public.likes;
create policy "likes: own read" on public.likes for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy "likes: own insert" on public.likes for insert with check (auth.uid() = from_user);

drop policy if exists "matches: participants" on public.matches;
create policy "matches: participants" on public.matches for select using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "messages: participants" on public.messages;
drop policy if exists "messages: own insert" on public.messages;
create policy "messages: participants" on public.messages for select using (exists (select 1 from public.matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())));
create policy "messages: own insert" on public.messages for insert with check (auth.uid() = sender_id);

drop policy if exists "subs: own" on public.subscriptions;
create policy "subs: own" on public.subscriptions for select using (auth.uid() = user_id);
drop policy if exists "subs_events: own" on public.subscription_events;
create policy "subs_events: own" on public.subscription_events for select using (auth.uid() = user_id);

drop policy if exists "ai: own read" on public.ai_inferences;
drop policy if exists "ai: own delete" on public.ai_inferences;
create policy "ai: own read" on public.ai_inferences for select using (auth.uid() = user_id);
create policy "ai: own delete" on public.ai_inferences for delete using (auth.uid() = user_id);

drop policy if exists "blocks: own" on public.blocks;
create policy "blocks: own" on public.blocks for all using (auth.uid() = blocker_id);
drop policy if exists "reports: own insert" on public.reports;
create policy "reports: own insert" on public.reports for insert with check (auth.uid() = reporter_id);
