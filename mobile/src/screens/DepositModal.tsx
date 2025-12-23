import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button } from 'react-native-paper';

export default function DepositModal() {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Deposit</Title>
      <Text style={styles.text}>Deposit funds to your wallet.</Text>
      <Button mode="contained" style={styles.button}>Copy Address</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  title: { color: '#fff', marginBottom: 16 },
  text: { color: '#aaa', marginBottom: 24 },
  button: { backgroundColor: '#7c3aed' },
});
