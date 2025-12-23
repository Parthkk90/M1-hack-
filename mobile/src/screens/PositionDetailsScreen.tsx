import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function PositionDetailsScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Position Details</Title>
      <Text style={styles.text}>Monitor your position here.</Text>
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('ClosePositionModal')}>Close Position</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  title: { color: '#fff', marginBottom: 16 },
  text: { color: '#aaa', marginBottom: 24 },
  button: { backgroundColor: '#7c3aed' },
});
