import { supabase } from './supabase';

export async function pickAndUploadPhoto(): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const ImagePicker = await import('expo-image-picker');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return { ok: false, error: 'Permiso de galería denegado' };

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) {
      return { ok: false, error: 'No se seleccionó imagen' };
    }

    const asset = result.assets[0];
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return { ok: false, error: 'No autenticado' };

    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const path = `profiles/${me.user.id}/${Date.now()}.${ext}`;
    const blob = await (await fetch(asset.uri)).blob();

    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(path, blob, { contentType: asset.mimeType ?? 'image/jpeg', upsert: true });

    if (error) return { ok: false, error: error.message };

    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Error al subir foto' };
  }
}
