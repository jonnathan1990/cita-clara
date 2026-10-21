import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function DataPanel() {
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const { data, error } = await supabase.from('ai_inferences').select('*');
    if (error) return Alert.alert('Error', error.message);
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    const { error } = await supabase.from('ai_inferences').delete().eq('id', id);
    if (error) return Alert.alert('Error', error.message);
    load();
  }

  return (
    <FlatList data={rows} keyExtractor={(r) => r.id} contentContainerStyle={{ padding: 24, gap: 12 }}
      renderItem={({ item }) => (
        <View style={{ borderWidth: 1, padding: 12, gap: 6, borderRadius: 8 }}>
          <Text style={{ fontWeight: '700' }}>{item.label}: {item.value}</Text>
          <Text style={{ color: '#555' }}>Fuente: {item.source}</Text>
          <Button title="Borrar inferencia" onPress={() => del(item.id)} />
        </View>
      )}
      ListEmptyComponent={<Text>No hay inferencias guardadas.</Text>} />
  );
}
