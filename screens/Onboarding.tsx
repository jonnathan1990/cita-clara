import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { validateSignup } from '../lib/validation';

const STEPS = ['Cuenta', 'Perfil', 'País y fecha'];

export default function Onboarding({ navigation }: any) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [country, setCountry] = useState('MX');

  async function finish() {
    const v = validateSignup({ email, password, birthDate, country });
    if (!v.ok) return Alert.alert('Revisa tus datos', v.errors.join('\n'));

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return Alert.alert('Error', error.message);

    const { error: pErr } = await supabase.from('profiles').insert({
      id: data.user!.id,
      display_name: name,
      bio,
      birth_date: birthDate,
      country,
    });
    if (pErr) return Alert.alert('Error', pErr.message);

    navigation.replace('Discover');
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>
        Paso {step + 1}/3 — {STEPS[step]}
      </Text>

      {step === 0 && (
        <>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
          <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
          <Button title="Siguiente" onPress={() => setStep(1)} />
        </>
      )}

      {step === 1 && (
        <>
          <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
          <TextInput placeholder="Bio" value={bio} onChangeText={setBio} multiline style={{ borderWidth: 1, padding: 12, borderRadius: 8, height: 90 }} />
          <Button title="Siguiente" onPress={() => setStep(2)} />
          <Button title="Atrás" onPress={() => setStep(0)} />
        </>
      )}

      {step === 2 && (
        <>
          <TextInput placeholder="Fecha de nacimiento (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
          <TextInput placeholder="País (MX / US / ES)" value={country} onChangeText={setCountry} autoCapitalize="characters" style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
          <Text style={{ color: '#555', fontSize: 13 }}>
            Nota de privacidad: tu país solo se usa para paridad de precios. Nunca usamos edad, género, orientación o salud para precios.
          </Text>
          <Button title="Crear cuenta" onPress={finish} />
          <Button title="Atrás" onPress={() => setStep(1)} />
        </>
      )}
    </ScrollView>
  );
}
