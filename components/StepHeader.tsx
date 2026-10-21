import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.step}>Paso {step}/{total}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  step: { fontSize: 13, color: '#888', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
});
