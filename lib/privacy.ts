import { supabase } from './supabase';

export async function exportMyData() {
  const { data, error } = await supabase.rpc('export_my_data');
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, data };
}

export async function deleteMyAccount() {
  const { error } = await supabase.rpc('request_account_deletion');
  if (error) return { ok: false as const, error: error.message };
  await supabase.auth.signOut();
  return { ok: true as const };
}
