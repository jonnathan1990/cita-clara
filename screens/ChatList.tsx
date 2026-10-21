import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ChatList({ navigation }: any) {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: me } = await supabase.auth.getUser();
      if (!me.user) return;
      const { data } = await supabase.from('matches').select('id,user_a,user_b')
        .or(`user_a.eq.${me.user.id},user_b.eq.${me.user.id}`);
      setMatches(data || []);
    })();
  }, []);

  return (
    <FlatList data={matches} keyExtractor={(m) => m.id} contentContainerStyle={{ padding: 24, gap: 12 }}
      renderItem={({ item }) => (
        <Button title={`Match ${item.id.slice(0, 6)}`} onPress={() => navigation.navigate('Chat', { matchId: item.id })} />
      )}
      ListEmptyComponent={<Text>Sin matches aún.</Text>} />
  );
}
