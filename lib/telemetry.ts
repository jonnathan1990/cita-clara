import { supabase } from './supabase';

const WHITELIST = new Set([
  'app_open',
  'onboarding_step',
  'profile_created',
  'like_sent',
  'pass_sent',
  'match_created',
  'paywall_viewed',
  'purchase_started',
  'purchase_success',
  'purchase_canceled',
  'cancel_flow_started',
  'cancel_completed',
  'subscription_canceled',
  'data_panel_viewed',
  'inference_deleted',
  'pause_success_activated',
  'boost_impact_viewed',
  'verification_submitted',
  'report_submitted',
  'block_submitted',
]);

export async function track(
  event: string,
  properties: Record<string, string | number | boolean> = {}
) {
  if (!WHITELIST.has(event)) {
    if (__DEV__) console.warn(`Evento no permitido: ${event}`);
    return;
  }
  const { data: me } = await supabase.auth.getUser();
  await supabase.from('telemetry_events').insert({
    user_id: me.user?.id ?? null,
    event,
    properties,
  });
}
