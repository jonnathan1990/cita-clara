-- Trigger match mutuo
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

-- Cancelar suscripción (≤2 pantallas)
create or replace function public.cancel_my_subscription(screens_used int default 2)
returns void language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  sub record;
  within_window boolean;
begin
  if uid is null then raise exception 'No autenticado'; end if;
  if screens_used > 2 then raise exception 'La cancelación debe completarse en 2 pantallas o menos.'; end if;

  select * into sub from public.subscriptions
   where user_id = uid and status = 'active'
   order by created_at desc limit 1;
  if sub is null then raise exception 'No hay suscripción activa'; end if;

  within_window := (now() - coalesce(sub.started_at, sub.created_at)) < interval '14 days';

  update public.subscriptions set status = 'canceled', canceled_at = now() where id = sub.id;

  insert into public.subscription_events (user_id, event, screens_to_cancel, within_refund_window, amount_cents)
  values (uid, 'canceled', screens_used, within_window, sub.amount_cents);
end;
$$;

create or replace function public.kpi_snapshot()
returns jsonb language plpgsql security definer as $$
begin
  return jsonb_build_object(
    'active_subs', (select count(*) from public.subscriptions where status = 'active'),
    'canceled_30d', (select count(*) from public.subscription_events where event = 'canceled' and created_at > now() - interval '30 days'),
    'avg_screens_to_cancel', (select coalesce(avg(screens_to_cancel), 0) from public.subscription_events where event = 'canceled' and created_at > now() - interval '30 days'),
    'total_profiles', (select count(*) from public.profiles)
  );
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
