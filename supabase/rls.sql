alter table public.profiles enable row level security;
alter table public.likes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_events enable row level security;
alter table public.ai_inferences enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

create policy "profiles: public read" on public.profiles for select using (true);
create policy "profiles: own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

create policy "likes: own read" on public.likes for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy "likes: own insert" on public.likes for insert with check (auth.uid() = from_user);

create policy "matches: participants" on public.matches for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "messages: participants" on public.messages for select
  using (exists (select 1 from public.matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())));
create policy "messages: own insert" on public.messages for insert with check (auth.uid() = sender_id);

create policy "subs: own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "subs_events: own" on public.subscription_events for select using (auth.uid() = user_id);

create policy "ai: own read" on public.ai_inferences for select using (auth.uid() = user_id);
create policy "ai: own delete" on public.ai_inferences for delete using (auth.uid() = user_id);

create policy "blocks: own" on public.blocks for all using (auth.uid() = blocker_id);
create policy "reports: own insert" on public.reports for insert with check (auth.uid() = reporter_id);
