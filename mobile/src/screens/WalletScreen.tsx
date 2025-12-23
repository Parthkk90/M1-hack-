import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, Card, Button } from 'react-native-paper';

const assets = [
  { name: 'Aptos', ticker: 'APT', amount: '14.52', usd: '$167.50' },
  { name: 'USD Coin', ticker: 'USDC', amount: '5,240.00', usd: '$5,240.00' },
  { name: 'Tether', ticker: 'USDT', amount: '2,100.00', usd: '$2,100.00' },
  { name: 'Ethereum', ticker: 'ETH', amount: '0.85', usd: '$1,785.00' },
];

export default function WalletScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Title style={styles.title}>Wallet</Title>
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text style={styles.balance}>$18,450.75</Text>
          <Text style={styles.address}>0x9291...e5a7</Text>
          <Button mode="contained" style={styles.actionBtn}>Deposit</Button>
          <Button mode="outlined" style={styles.actionBtn}>Withdraw</Button>
          <Button mode="outlined" style={styles.actionBtn}>Swap</Button>
        </Card.Content>
      </Card>
      <Title style={styles.assetsTitle}>Assets</Title>
      {assets.map((a, i) => (
        <Card key={i} style={styles.assetCard}>
          <Card.Content>
            <Text>{a.name} ({a.ticker})</Text>
            <Text>{a.amount}   {a.usd}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  title: { color: '#fff', marginBottom: 12 },
  balanceCard: { marginBottom: 16, backgroundColor: '#181825' },
  balance: { fontSize: 24, color: '#7c3aed', marginBottom: 4 },
  address: { color: '#aaa', marginBottom: 8 },
  actionBtn: { marginVertical: 4 },
  assetsTitle: { color: '#fff', marginTop: 16, marginBottom: 8 },
  assetCard: { marginBottom: 12, backgroundColor: '#222' },
});
