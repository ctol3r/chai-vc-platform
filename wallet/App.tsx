import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { generateAndStoreKey, getKeyWithBiometrics } from './src/keyManager';

export default function App() {
  const [stored, setStored] = useState(false);
  const [key, setKey] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Button
        testID="generate-key"
        title="Generate Key"
        onPress={async () => {
          await generateAndStoreKey();
          setStored(true);
        }}
      />
      {stored && <Text testID="key-generated">Key stored securely.</Text>}
      <Button
        testID="unlock-key"
        title="Unlock"
        onPress={async () => {
          const k = await getKeyWithBiometrics();
          setKey(k);
        }}
      />
      {key && <Text testID="key-value">{key}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
