import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../theme';

const curatedBundles = [
  { 
    name: 'Mega Cap Index', 
    description: 'BTC & ETH weighted basket', 
    type: 'LONG', 
    tvl: '$12.5M', 
    apy: '+18.5%',
    allocation: { BTC: 60, ETH: 40 },
    risk: 'Low'
  },
  { 
    name: 'DeFi Leaders', 
    description: 'Top DeFi protocols', 
    type: 'LONG', 
    tvl: '$5.8M', 
    apy: '+24.2%',
    allocation: { ETH: 50, SOL: 30, BTC: 20 },
    risk: 'Medium'
  },
  { 
    name: 'Layer 1 Mix', 
    description: 'Leading L1 blockchains', 
    type: 'LONG', 
    tvl: '$8.3M', 
    apy: '+15.8%',
    allocation: { ETH: 40, SOL: 35, BTC: 25 },
    risk: 'Medium'
  },
];

function MarketScreen() {
  const navigation = useNavigation<any>();

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Low': return Colors.green;
      case 'Medium': return Colors.orange;
      case 'High': return Colors.red;
      default: return Colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.md }}>
      <Text style={styles.title}>Market</Text>
      <Text style={styles.subtitle}>Explore curated basket strategies</Text>

      {curatedBundles.map((basket, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.card}
          onPress={() => navigation.navigate('BasketBuilder', { bundle: basket })}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{basket.name}</Text>
              <View style={[
                styles.typeBadge, 
                { backgroundColor: basket.type === 'LONG' ? Colors.green + '20' : Colors.red + '20' }
              ]}>
                <Text style={[
                  styles.typeText,
                  { color: basket.type === 'LONG' ? Colors.green : Colors.red }
                ]}>
                  {basket.type}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>{basket.description}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TVL</Text>
              <Text style={styles.statValue}>{basket.tvl}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>APY</Text>
              <Text style={[
                styles.statValue,
                { color: basket.apy.startsWith('+') ? Colors.green : Colors.red }
              ]}>
                {basket.apy}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Risk</Text>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(basket.risk) + '20' }]}>
                <Text style={[styles.riskText, { color: getRiskColor(basket.risk) }]}>
                  {basket.risk}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.allocationRow}>
            <Text style={styles.allocationLabel}>Allocation:</Text>
            {Object.entries(basket.allocation).map(([asset, weight]) => (
              <Text key={asset} style={styles.allocationText}>
                {asset} {weight}%
              </Text>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.tradeButton}
            onPress={() => navigation.navigate('BasketBuilder', { bundle: basket })}
          >
            <Text style={styles.tradeButtonText}>Trade This Bundle</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  title: { 
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs 
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  card: { 
    marginBottom: Spacing.md, 
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.medium,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  cardDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  riskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  allocationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  allocationLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  allocationText: {
    ...Typography.caption,
    color: Colors.text,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  tradeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function MarketScreenWithNav() {
  return (
    <View style={{ flex: 1 }}>
      <MarketScreen />
      <BottomTabNavigator />
    </View>
  );
}
