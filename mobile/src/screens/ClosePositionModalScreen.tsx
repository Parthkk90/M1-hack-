import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ClosePositionModalScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Close Position Modal Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24 }
});

export default ClosePositionModalScreen;
