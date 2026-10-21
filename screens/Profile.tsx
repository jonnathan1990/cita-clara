import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Profile({ navigation }: any) {
  async function deleteAccount() {
    Alert.alert('Borrar cuenta', 'Esta acción es irreversible.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar', style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.rpc('request_account_deletion');
          if (error) return Alert.alert('Error', error.message);
          await supabase.auth.signOut();
          Alert.alert('Cuenta eliminada', 'Tus datos han sido borrados.');
        },
      },
    ]);
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Mi cuenta</Text>
      <Button title="Ver planes (CitaClara+)" onPress={() => navigation.navigate('Paywall')} />
      <Button title="Ver mis datos e inferencias IA" onPress={() => navigation.navigate('DataPanel')} />
      <Button title="Gestionar suscripción" onPress={() => navigation.navigate('CancelSubscription')} />
      <Button title="Borrar mi cuenta" onPress={deleteAccount} color="#c0392b" />
      <Button title="Cerrar sesión" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}
