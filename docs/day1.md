# Día 1 — Checklist de ejecución

## Pre-requisitos
- [ ] Cuenta Supabase creada
- [ ] Cuenta Stripe (modo Test) creada
- [ ] Productos/precios creados en Stripe (MX/US/ES × monthly/quarterly)
- [ ] Expo Go instalado en el teléfono

## Pasos
1. `./scripts/setup.sh`
2. Rellenar `.env`
3. Pegar `supabase/FULL_SETUP.sql` en SQL Editor
4. `export STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=...`
5. `./scripts/deploy-stripe.sh`
6. Configurar webhook en Stripe Dashboard → `.../functions/v1/stripe-webhook`
7. `npx expo start -c`
8. Crear cuenta → Discover → Like → (seed) → Match → Chat
9. Paywall → pago de prueba con tarjeta `4242 4242 4242 4242`
10. Cancelar en 2 pantallas

## Checkpoint final
```sql
select * from public.profiles;
select * from public.subscriptions;
select * from public.subscription_events;
select * from public.kpi_snapshot();
```
