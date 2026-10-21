import React, { useState } from 'react';
import { View, Text, Button, Alert, Image } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Verification() {
  const [uri, setUri] = useState<string | null>(null);

  async function pick() {
    try {
      const ImagePicker = await import('expo-image-picker');
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return Alert.alert('Permiso denegado');
      const r = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!r.canceled) setUri(r.assets[0].uri);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo abrir la cámara');
    }
  }

  async function submit() {
    if (!uri) return;
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;
    const path = `verification/${me.user.id}.jpg`;
    const blob = await (await fetch(uri)).blob();
    const { error } = await supabase.storage
      .from('verifications')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) return Alert.alert('Error', error.message);
    await supabase.from('verification_requests').insert({ user_id: me.user.id, status: 'pending' });
    Alert.alert('Recibido', 'Revisaremos tu verificación en menos de 24 h. Siempre es gratis.');
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text>Verificación gratuita. Una selfie rápida. Nunca se muestra a otros usuarios.</Text>
      {uri && <Image source={{ uri }} style={{ width: 160, height: 160, borderRadius: 80 }} />}
      <Button title="Tomar selfie" onPress={pick} />
      <Button title="Enviar a revisión" onPress={submit} />
    </View>
  );
}
