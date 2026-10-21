import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

type Profile = { id: string; display_name: string; bio: string | null; country: string };

export default function Discover({ navigation }: any) {
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [idx, setIdx] = useState(0);

  const load = useCallback(async () => {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id,display_name,bio,country')
      .neq('id', me.user.id)
      .limit(20);
    if (error) return Alert.alert('Error', error.message);
    setCandidates((data as Profile[]) || []);
    setIdx(0);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function like(targetId: string) {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;
    const { error } = await supabase.from('likes').insert({
      from_user: me.user.id,
      to_user: targetId,
    });
    if (error && !error.message.includes('duplicate')) Alert.alert('Error', error.message);
    setIdx((i) => i + 1);
  }

  function skip() { setIdx((i) => i + 1); }

  if (idx >= candidates.length) {
    return (
      <View style={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 20 }}>No hay más perfiles por ahora.</Text>
        <Button title="Recargar" onPress={load} />
        <Button title="Ir al chat" onPress={() => navigation.navigate('ChatList')} />
        <Button title="Mi perfil" onPress={() => navigation.navigate('Profile')} />
      </View>
    );
  }

  const c = candidates[idx];
  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>{c.display_name}</Text>
      <Text style={{ color: '#555' }}>{c.country}</Text>
      <Text>{c.bio || 'Sin bio'}</Text>
      <Button title="Like" onPress={() => like(c.id)} />
      <Button title="Pasar" onPress={skip} />
      <Button title="Chats" onPress={() => navigation.navigate('ChatList')} />
      <Button title="Mi perfil" onPress={() => navigation.navigate('Profile')} />
    </View>
  );
}
