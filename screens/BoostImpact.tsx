import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { track } from '../lib/telemetry';

export default function BoostImpact() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      await track('boost_impact_viewed');
      const { data } = await supabase
        .from('boost_impacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setRows(data || []);
    })();
  }, []);

  return (
    <FlatList
      data={rows}
      keyExtractor={(r) => r.id}
      contentContainerStyle={{ padding: 24, gap: 12 }}
      ListHeaderComponent={
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>
          Impacto de boosts
        </Text>
      }
      renderItem={({ item }) => (
        <View style={{ borderWidth: 1, padding: 12, borderRadius: 8, gap: 4 }}>
          <Text style={{ fontWeight: '700' }}>{item.kind}</Text>
          <Text>Vistas: {item.views} · Likes: {item.likes} · Matches: {item.matches}</Text>
          <Text style={{ color: '#555' }}>Costo mostrado: {item.cost_display}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>Aún no has usado boosts. Cuando lo hagas, verás el impacto real aquí.</Text>}
    />
  );
}
