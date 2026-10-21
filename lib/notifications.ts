import { supabase } from './supabase';

export async function registerPushToken(token: string) {
  const { data: me } = await supabase.auth.getUser();
  if (!me.user) return;
  await supabase.from('push_tokens').upsert({
    user_id: me.user.id,
    token,
    updated_at: new Date().toISOString(),
  });
}

export async function requestNotificationPermissions() {
  try {
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
