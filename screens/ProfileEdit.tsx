import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileEdit({ navigation }: any) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    (async () => {
      const { data: me } = await supabase.auth.getUser();
      if (!me.user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, bio')
        .eq('id', me.user.id)
        .single();
      if (data) {
        setName(data.display_name ?? '');
        setBio(data.bio ?? '');
      }
    })();
  }, []);

  async function save() {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name, bio })
      .eq('id', me.user.id);
    if (error) return Alert.alert('Error', error.message);
    Alert.alert('Guardado');
    navigation.goBack();
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Bio"
        multiline
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, height: 100 }}
      />
      <Button title="Guardar" onPress={save} />
    </View>
  );
}
