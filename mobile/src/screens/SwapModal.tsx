import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button } from 'react-native-paper';

export default function SwapModal() {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Swap</Title>
      <Text style={styles.text}>Swap tokens in your wallet.</Text>
      <Button mode="contained" style={styles.button}>Swap</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  title: { color: '#fff', marginBottom: 16 },
  text: { color: '#aaa', marginBottom: 24 },
  button: { backgroundColor: '#7c3aed' },
});
