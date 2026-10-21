import { supabase } from './supabase';

export async function cancelMySubscription(screensUsed = 2): Promise<{ ok: boolean; error?: string }> {
  if (screensUsed > 2) {
    return { ok: false, error: 'La cancelación debe completarse en 2 pantallas o menos.' };
  }
  const { error } = await supabase.rpc('cancel_my_subscription', { screens_used: screensUsed });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchKpiSnapshot() {
  const { data, error } = await supabase.rpc('kpi_snapshot');
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, data };
}
