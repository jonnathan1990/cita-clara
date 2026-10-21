#!/usr/bin/env bash
set -euo pipefail

echo "=== CitaClara — Deploy Stripe ==="

if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
  echo "ERROR: exporta STRIPE_SECRET_KEY antes de correr este script"
  exit 1
fi
if [[ -z "${STRIPE_WEBHOOK_SECRET:-}" ]]; then
  echo "ERROR: exporta STRIPE_WEBHOOK_SECRET antes de correr este script"
  exit 1
fi

echo "→ Configurando secrets..."
supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"

for var in STRIPE_PRICE_MX_MONTHLY STRIPE_PRICE_MX_QUARTERLY \
           STRIPE_PRICE_US_MONTHLY STRIPE_PRICE_US_QUARTERLY \
           STRIPE_PRICE_ES_MONTHLY STRIPE_PRICE_ES_QUARTERLY; do
  if [[ -n "${!var:-}" ]]; then
    supabase secrets set "$var=${!var}"
  fi
done

echo "→ Desplegando Edge Functions..."
supabase functions deploy create-subscription --no-verify-jwt
supabase functions deploy create-portal-session --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt

echo ""
echo "✅ Deploy completado."
echo "Recuerda apuntar el webhook de Stripe a:"
echo "  https://TU_REF.supabase.co/functions/v1/stripe-webhook"
