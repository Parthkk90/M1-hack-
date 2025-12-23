import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, Card, Chip } from 'react-native-paper';

const baskets = [
  { name: 'Mega Cap Index', desc: 'BTC & ETH weighted basket', type: 'LONG', tvl: '$12.5M', apy: '+18.5%' },
  { name: 'DeFi Leaders', desc: 'Top DeFi protocols', type: 'LONG', tvl: '$5.8M', apy: '+24.2%' },
  { name: 'Layer 1 Mix', desc: 'Leading L1 blockchains', type: 'LONG', tvl: '$8.3M', apy: '+15.8%' },
  { name: 'Metaverse Shorts', desc: 'Short metaverse tokens', type: 'SHORT', tvl: '$3.2M', apy: '-8.5%' },
];

export default function MarketScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Title style={styles.title}>Market</Title>
      <View style={styles.filters}>
        <Chip style={styles.chip} selected>All</Chip>
        <Chip style={styles.chip}>Long</Chip>
        <Chip style={styles.chip}>Short</Chip>
        <Chip style={styles.chip}>New</Chip>
      </View>
      {baskets.map((b, i) => (
        <Card key={i} style={styles.card}>
          <Card.Title title={b.name} subtitle={b.desc} right={() => <Chip style={b.type === 'LONG' ? styles.long : styles.short}>{b.type}</Chip>} />
          <Card.Content>
            <Text>TVL: {b.tvl}   APY: {b.apy}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  title: { color: '#fff', marginBottom: 12 },
  filters: { flexDirection: 'row', marginBottom: 16 },
  chip: { marginRight: 8, backgroundColor: '#222' },
  card: { marginBottom: 16, backgroundColor: '#181825' },
  long: { backgroundColor: '#10b981', color: '#fff' },
  short: { backgroundColor: '#ef4444', color: '#fff' },
});
