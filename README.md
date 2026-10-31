# CitaClara

App de citas con monetización ética — Expo + Supabase + Stripe.

## Arranque en 5 pasos

1. `cp .env.example .env` → pega `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Supabase SQL Editor → ejecuta **todo** `supabase/SETUP_TODO_EN_UNO.sql`
3. Auth → Email ON, Confirm email **OFF** (pruebas)
4. `npm install && npx expo install @stripe/stripe-react-native expo-secure-store && npx expo start -c`
5. Crea cuenta → Discover

## Documentos del ecosistema

| Doc | Contenido |
|-----|-----------|
| `INVENTARIO.md` | Lista de archivos |
| `docs/BRIEF_VIRAL.md` | Brief épico + plan 14 días |
| `docs/INVERSION.md` | One-pager para inversión |
| `docs/PROMPTS_ASISTENTE.md` | Prompts para asignar a IA |
| `docs/day1.md` | Checklist día 1 |
| `supabase/SETUP_TODO_EN_UNO.sql` | Schema + funciones + RLS |

## Pagos (después del core)

1. Stripe Dashboard: productos monthly/quarterly (MX/US/ES)
2. Secrets en Supabase + `./scripts/deploy-stripe.sh`
3. Webhook → `stripe-webhook` Edge Function

## Ética (no negociable)

- Precio solo por país + plan
- Cancelación ≤ 2 pantallas
- IA visible y borrable
- Seguridad siempre gratis
