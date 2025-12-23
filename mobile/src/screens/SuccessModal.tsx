import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function SuccessModal() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Success!</Title>
      <Text style={styles.text}>Position closed successfully.</Text>
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('Dashboard')}>Return to Dashboard</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  title: { color: '#10b981', marginBottom: 16 },
  text: { color: '#fff', marginBottom: 24 },
  button: { backgroundColor: '#7c3aed' },
});
