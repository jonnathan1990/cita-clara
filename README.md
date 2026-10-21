# CitaClara

App de citas con monetización ética. Pagos con **Stripe**.

## Stack
- Expo + React Native
- Supabase (Auth, Postgres, Realtime, Edge Functions)
- Stripe (suscripciones + Customer Portal)
- Cancelación en ≤ 2 pantallas
- Precios solo por país + plan (nunca por edad/género/orientación/salud)

## Setup rápido

```bash
# 1. Clonar / entrar
cd cita-clara
./scripts/setup.sh

# 2. Rellenar .env
# EXPO_PUBLIC_SUPABASE_URL=
# EXPO_PUBLIC_SUPABASE_ANON_KEY=
# EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 3. SQL (Supabase → SQL Editor)
# Pega el contenido de supabase/FULL_SETUP.sql

# 4. Desplegar Edge Functions
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
./scripts/deploy-stripe.sh

# 5. Arrancar
npx expo start -c
```

## Stripe Dashboard

1. Products → crea precios mensuales/trimestrales para MX, US, ES
2. API Keys → copia pk_test_ y sk_test_
3. Webhooks → endpoint:
   `https://TU_REF.supabase.co/functions/v1/stripe-webhook`
   Eventos: customer.subscription.*, invoice.payment_succeeded

## Reglas éticas (lib/ethics.ts)

- Precio solo por `country` + `plan`
- Cancelación ≤ 2 pantallas
- Ventana de reembolso ≥ 14 días
- Seguridad (verificación/bloqueo/reporte) siempre gratis
- Sin plan semanal por defecto
- Sin urgencia artificial

## Scripts

| Comando | Descripción |
|---------|-------------|
| `./scripts/setup.sh` | Instala dependencias |
| `./scripts/deploy-stripe.sh` | Secrets + Edge Functions |
| `npm test` | Tests unitarios |
| `npx expo start -c` | Arranca la app |
