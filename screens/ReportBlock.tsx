import React, { useState } from 'react';
import { View, Text, Button, Alert, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { track } from '../lib/telemetry';

export default function ReportBlock({ route, navigation }: any) {
  const targetId = route.params?.userId as string | undefined;
  const [reason, setReason] = useState('spam');

  async function report() {
    if (!targetId) return Alert.alert('Error', 'Usuario no especificado');
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;
    const { error } = await supabase.from('reports').insert({
      reporter_id: me.user.id,
      reported_id: targetId,
      reason,
    });
    if (error) return Alert.alert('Error', error.message);
    await track('report_submitted', { reason });
    Alert.alert('Reporte enviado', 'Gracias. Revisaremos el caso.');
    navigation.goBack();
  }

  async function block() {
    if (!targetId) return Alert.alert('Error', 'Usuario no especificado');
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;
    const { error } = await supabase.from('blocks').insert({
      blocker_id: me.user.id,
      blocked_id: targetId,
    });
    if (error) return Alert.alert('Error', error.message);
    await track('block_submitted');
    Alert.alert('Usuario bloqueado');
    navigation.goBack();
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Reportar / Bloquear</Text>
      <Text>La seguridad siempre es gratis.</Text>
      <TextInput
        value={reason}
        onChangeText={setReason}
        placeholder="Motivo (spam, harassment, other...)"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />
      <Button title="Enviar reporte" onPress={report} />
      <Button title="Bloquear usuario" onPress={block} color="#c0392b" />
    </View>
  );
}
