import React, { useState } from 'react';
import { View, Button, Alert, Image, Text } from 'react-native';
import { pickAndUploadPhoto } from '../lib/storage';
import { supabase } from '../lib/supabase';

export default function PhotoUpload() {
  const [url, setUrl] = useState<string | null>(null);

  async function pick() {
    const res = await pickAndUploadPhoto();
    if (!res.ok) return Alert.alert('Error', res.error);
    setUrl(res.url);
    const { data: me } = await supabase.auth.getUser();
    if (me.user) {
      await supabase.from('profiles').update({ photo_url: res.url }).eq('id', me.user.id);
    }
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      {url ? (
        <Image source={{ uri: url }} style={{ width: 200, height: 200, borderRadius: 100, alignSelf: 'center' }} />
      ) : (
        <Text>Sin foto aún.</Text>
      )}
      <Button title="Elegir y subir" onPress={pick} />
    </View>
  );
}
