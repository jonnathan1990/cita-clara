-- Migración: Stripe como proveedor principal de pagos

alter table public.profiles
  add column if not exists stripe_customer_id text unique;

alter table public.subscriptions
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists amount_cents int,
  add column if not exists currency text,
  add column if not exists country text,
  add column if not exists started_at timestamptz,
  add column if not exists expires_at timestamptz;

create index if not exists idx_subscriptions_stripe_sub
  on public.subscriptions (stripe_subscription_id);

create index if not exists idx_profiles_stripe_customer
  on public.profiles (stripe_customer_id);
