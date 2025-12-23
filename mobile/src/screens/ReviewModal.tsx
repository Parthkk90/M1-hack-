import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function ReviewModal() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Review Position</Title>
      <Text style={styles.text}>Confirm your basket and leverage.</Text>
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('PositionDetails')}>Confirm</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  title: { color: '#fff', marginBottom: 16 },
  text: { color: '#aaa', marginBottom: 24 },
  button: { backgroundColor: '#7c3aed' },
});
