#!/usr/bin/env bash
set -euo pipefail

echo "=== CitaClara — Setup local ==="

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "→ Creado .env desde .env.example — ¡rellénalo con tus claves!"
fi

echo "→ Instalando dependencias..."
npm install
npx expo install --fix
npx expo install @stripe/stripe-react-native expo-secure-store

echo ""
echo "✅ Setup listo."
echo "1. Rellena .env con tus claves de Supabase y Stripe"
echo "2. En Supabase SQL Editor pega supabase/FULL_SETUP.sql"
echo "3. Despliega funciones: ./scripts/deploy-stripe.sh"
echo "4. npx expo start -c"
