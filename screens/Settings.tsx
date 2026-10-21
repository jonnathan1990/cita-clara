import React from 'react';
import { View, Text, Button } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Settings({ navigation }: any) {
  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Ajustes</Text>
      <Button title="Editar perfil" onPress={() => navigation.navigate('ProfileEdit')} />
      <Button title="Verificación" onPress={() => navigation.navigate('Verification')} />
      <Button title="Legal" onPress={() => navigation.navigate('Legal')} />
      <Button title="Cerrar sesión" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}
