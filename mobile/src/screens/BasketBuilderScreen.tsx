import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { api } from '../components/integration';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

export default function BasketBuilderScreen() {
  const navigation = useNavigation();
  const [btcWeight, setBtcWeight] = useState(50);
  const [ethWeight, setEthWeight] = useState(30);
  const [solWeight, setSolWeight] = useState(20);
  const [leverage, setLeverage] = useState(5);
  const [amount, setAmount] = useState('0.1');
  const [isLong, setIsLong] = useState(true);
  const [marketData, setMarketData] = useState<any[]>([]);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      const data = await api.fetchMarketData();
      setMarketData(data);
    } catch (error) {
      console.error('Failed to load market data:', error);
    }
  };

  const getRiskLevel = () => {
    if (leverage <= 5) return { label: 'Low Risk', color: Colors.yellow };
    if (leverage <= 10) return { label: 'Medium Risk', color: Colors.orange };
    return { label: 'High Risk', color: Colors.error };
  };

  const handleCreatePosition = async () => {
    try {
      const result = await api.openPosition(
        parseFloat(amount),
        leverage,
        btcWeight,
        ethWeight,
        solWeight,
        isLong
      );
      console.log('Position created:', result);
      navigation.navigate('Portfolio' as never);
    } catch (error) {
      console.error('Failed to create position:', error);
    }
  };

  const risk = getRiskLevel();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The Standard Bundle</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bundle Info Card */}
        <View style={styles.bundleCard}>
          <View style={styles.bundleHeader}>
            <Ionicons name="trending-up" size={20} color={Colors.primary} />
            <Text style={styles.bundleTitle}>The Standard Bundle</Text>
          </View>
          
          <Text style={styles.bundleWeights}>
            BTC {btcWeight}% • ETH {ethWeight}% • SOL {solWeight}%
          </Text>

          {/* Asset Prices */}
          <View style={styles.assetsContainer}>
            {marketData.map((asset, index) => (
              <View key={index} style={styles.assetRow}>
                <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                <Text style={styles.assetPrice}>${asset.price.toLocaleString()}</Text>
                <Text style={[
                  styles.assetChange,
                  { color: asset.change24h >= 0 ? Colors.error : Colors.error }
                ]}>
                  {asset.change24h >= 0 ? '' : ''}{asset.change24h.toFixed(2)}%
                </Text>
              </View>
            ))}
          </View>

          {/* Risk Badge */}
          <View style={[styles.riskBadge, { backgroundColor: `${risk.color}20` }]}>
            <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </View>

        {/* Investment Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Investment Amount</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.0"
            />
            <Text style={styles.inputCurrency}>MOVE</Text>
          </View>
          <Text style={styles.helperText}>Minimum: 0.1 MOVE</Text>
        </View>

        {/* Leverage Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Leverage: {leverage}x</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={20}
              step={1}
              value={leverage}
              onValueChange={setLeverage}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1x</Text>
              <Text style={styles.sliderLabel}>20x</Text>
            </View>
          </View>
        </View>

        {/* Position Direction */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Position Direction</Text>
          <View style={styles.directionButtons}>
            <TouchableOpacity
              style={[
                styles.directionButton,
                isLong && styles.longButtonActive,
              ]}
              onPress={() => setIsLong(true)}
            >
              <Ionicons 
                name="trending-up" 
                size={20} 
                color={isLong ? '#FFF' : Colors.green} 
              />
              <Text style={[
                styles.directionButtonText,
                isLong && styles.directionButtonTextActive
              ]}>
                LONG
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.directionButton,
                !isLong && styles.shortButtonActive,
              ]}
              onPress={() => setIsLong(false)}
            >
              <Ionicons 
                name="trending-down" 
                size={20} 
                color={!isLong ? '#FFF' : Colors.red} 
              />
              <Text style={[
                styles.directionButtonText,
                !isLong && styles.directionButtonTextActive
              ]}>
                SHORT
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>
            {isLong 
              ? 'Profit when bundle price increases' 
              : 'Profit when bundle price decreases'}
          </Text>
        </View>

        {/* Weight Sliders */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Asset Allocation</Text>
          
          <View style={styles.weightItem}>
            <View style={styles.weightHeader}>
              <Text style={styles.weightLabel}>BTC</Text>
              <Text style={styles.weightValue}>{btcWeight}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={btcWeight}
              onValueChange={(value) => {
                setBtcWeight(value);
                const remaining = 100 - value;
                const ethRatio = ethWeight / (ethWeight + solWeight) || 0.5;
                setEthWeight(Math.round(remaining * ethRatio));
                setSolWeight(remaining - Math.round(remaining * ethRatio));
              }}
              minimumTrackTintColor={Colors.orange}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.orange}
            />
          </View>

          <View style={styles.weightItem}>
            <View style={styles.weightHeader}>
              <Text style={styles.weightLabel}>ETH</Text>
              <Text style={styles.weightValue}>{ethWeight}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={ethWeight}
              onValueChange={(value) => {
                setEthWeight(value);
                const remaining = 100 - value;
                const btcRatio = btcWeight / (btcWeight + solWeight) || 0.5;
                setBtcWeight(Math.round(remaining * btcRatio));
                setSolWeight(remaining - Math.round(remaining * btcRatio));
              }}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
          </View>

          <View style={styles.weightItem}>
            <View style={styles.weightHeader}>
              <Text style={styles.weightLabel}>SOL</Text>
              <Text style={styles.weightValue}>{solWeight}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={solWeight}
              onValueChange={(value) => {
                setSolWeight(value);
                const remaining = 100 - value;
                const btcRatio = btcWeight / (btcWeight + ethWeight) || 0.5;
                setBtcWeight(Math.round(remaining * btcRatio));
                setEthWeight(remaining - Math.round(remaining * btcRatio));
              }}
              minimumTrackTintColor={Colors.green}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.green}
            />
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreatePosition}
        >
          <Text style={styles.createButtonText}>Create Position</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h3,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  bundleCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  bundleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bundleTitle: {
    ...Typography.h3,
    marginLeft: Spacing.sm,
  },
  bundleWeights: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  assetsContainer: {
    marginBottom: Spacing.md,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  assetSymbol: {
    ...Typography.body,
    fontWeight: '600',
    flex: 1,
  },
  assetPrice: {
    ...Typography.body,
    flex: 2,
    textAlign: 'right',
  },
  assetChange: {
    ...Typography.body,
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  riskText: {
    ...Typography.label,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.label,
    marginBottom: Spacing.md,
  },
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Shadows.small,
  },
  input: {
    flex: 1,
    ...Typography.h2,
    color: Colors.text,
  },
  inputCurrency: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  helperText: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  sliderContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    ...Typography.caption,
  },
  directionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  directionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  longButtonActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  shortButtonActive: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  directionButtonText: {
    ...Typography.body,
    fontWeight: '600',
    marginLeft: Spacing.sm,
    color: Colors.textSecondary,
  },
  directionButtonTextActive: {
    color: '#FFF',
  },
  weightItem: {
    marginBottom: Spacing.md,
  },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  weightLabel: {
    ...Typography.label,
  },
  weightValue: {
    ...Typography.label,
    color: Colors.primary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.medium,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
