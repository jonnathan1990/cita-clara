import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import ChatBubble from '../components/ChatBubble';

export default function Chat({ route }: any) {
  const { matchId } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: me } = await supabase.auth.getUser();
      setMyId(me.user?.id ?? null);
    })();

    supabase.from('messages').select('*').eq('match_id', matchId).order('created_at')
      .then(({ data }) => setMessages(data || []));

    const sub = supabase.channel(`chat:${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => setMessages((m) => [...m, payload.new]))
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [matchId]);

  async function send() {
    if (!text.trim() || !myId) return;
    await supabase.from('messages').insert({ match_id: matchId, sender_id: myId, body: text.trim() });
    setText('');
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList data={messages} keyExtractor={(m) => m.id} contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => <ChatBubble body={item.body} mine={item.sender_id === myId} />} />
      <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
        <TextInput value={text} onChangeText={setText} placeholder="Escribe..." style={{ flex: 1, borderWidth: 1, padding: 10, borderRadius: 8 }} />
        <Button title="Enviar" onPress={send} />
      </View>
    </View>
  );
}
