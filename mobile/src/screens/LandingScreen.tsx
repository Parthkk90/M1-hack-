import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function LandingScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Cresca</Title>
      <Text style={styles.subtitle}>Basket Protocol</Text>
      <Text style={styles.hero}>
        Trade Diversified <Text style={styles.highlight}>Crypto</Text>, One Position
      </Text>
      <Button 
        mode="contained" 
        style={styles.button} 
        onPress={() => navigation.navigate('Dashboard')}
      >
        Connect Wallet
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#0a0a0f' 
  },
  title: { 
    fontSize: 32, 
    color: '#7c3aed', 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  subtitle: { 
    color: '#aaa', 
    marginBottom: 24 
  },
  hero: { 
    fontSize: 28, 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 32 
  },
  highlight: { 
    color: '#7c3aed', 
    fontWeight: 'bold' 
  },
  button: { 
    width: 220, 
    marginTop: 16, 
    backgroundColor: '#7c3aed' 
  },
});
