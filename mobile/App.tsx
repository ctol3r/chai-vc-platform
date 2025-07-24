import React, { useCallback, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function App() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setIsBiometricSupported);
  }, []);

  const handleAuth = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Wallet',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false
      });
      if (result.success) {
        setAuthenticated(true);
        setErrorMessage('');
      } else {
        setErrorMessage(result.error || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  }, []);

  if (!authenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chai Wallet</Text>
        {isBiometricSupported ? (
          <Button title="Unlock with Biometrics" onPress={handleAuth} />
        ) : (
          <Text>Biometric authentication not available</Text>
        )}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet unlocked!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  title: {
    fontSize: 24,
    marginBottom: 16
  },
  error: {
    marginTop: 16,
    color: 'red'
  }
});
