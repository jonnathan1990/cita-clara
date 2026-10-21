import React from 'react';
import { View, Text } from 'react-native';

export default function ChatBubble({ body, mine }: { body: string; mine: boolean }) {
  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        backgroundColor: mine ? '#D6336C' : '#EEE',
        padding: 10,
        borderRadius: 12,
        maxWidth: '80%',
      }}
    >
      <Text style={{ color: mine ? 'white' : '#111' }}>{body}</Text>
    </View>
  );
}
