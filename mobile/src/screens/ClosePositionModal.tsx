import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function ClosePositionModal() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Close Position</Title>
      <Text style={styles.text}>Review and confirm closing your position.</Text>
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('SuccessModal')}>Confirm Close</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  title: { color: '#fff', marginBottom: 16 },
  text: { color: '#aaa', marginBottom: 24 },
  button: { backgroundColor: '#7c3aed' },
});
