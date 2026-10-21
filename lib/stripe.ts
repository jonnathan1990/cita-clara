import { initStripe, useStripe, presentPaymentSheet } from '@stripe/stripe-react-native';
import { supabase } from './supabase';
import { getPrice, Country, Plan } from './pricing';

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

let initialized = false;

export async function initStripeSDK() {
  if (initialized || !publishableKey) return;
  await initStripe({
    publishableKey,
    merchantIdentifier: 'merchant.com.citaclara.app',
    urlScheme: 'citaclara',
  });
  initialized = true;
}

export async function subscribeWithStripe(country: Country, plan: Plan): Promise<{ ok: boolean; error?: string }> {
  await initStripeSDK();
  const price = getPrice(country, plan);

  const { data, error } = await supabase.functions.invoke('create-subscription', {
    body: {
      plan,
      country,
      amount: price.amount,
      currency: price.currency.toLowerCase(),
    },
  });

  if (error || !data?.clientSecret) {
    return { ok: false, error: error?.message ?? data?.error ?? 'No se pudo iniciar el pago' };
  }

  const { error: presentError } = await presentPaymentSheet({
    clientSecret: data.clientSecret,
    merchantDisplayName: 'CitaClara',
  });

  if (presentError) {
    if (presentError.code === 'Canceled') {
      return { ok: false, error: 'Pago cancelado' };
    }
    return { ok: false, error: presentError.message };
  }

  return { ok: true };
}

export async function openCustomerPortal(): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: {},
  });

  if (error || !data?.url) {
    return { ok: false, error: error?.message ?? 'No se pudo abrir el portal' };
  }

  const { Linking } = await import('react-native');
  await Linking.openURL(data.url);
  return { ok: true };
}

export { useStripe };
