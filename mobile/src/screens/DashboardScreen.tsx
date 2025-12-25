import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { blockchain, api } from '../components/integration';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import BottomTabNavigator from '../navigation/BottomTabNavigator';

function DashboardScreen() {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(0);
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [percentChange, setPercentChange] = useState('+1.44');
  const [positions, setPositions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (blockchain.isConnected()) {
        const bal = await blockchain.getBalance();
        setBalance(bal);
        setBalanceUSD(bal * 50); // Assuming 1 MOVE = $50
        setIsConnected(true);
        
        const userPositions = await api.fetchPositions();
        setPositions(userPositions);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleConnect = async () => {
    try {
      await blockchain.connectWallet();
      await loadDashboardData();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.walletName}>Movement Baskets</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="copy-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Network Badge */}
        <View style={styles.networkBadge}>
          <View style={styles.networkDot} />
          <Text style={styles.networkText}>Movement Testnet</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total balance</Text>
          <Text style={styles.balanceAmount}>${balanceUSD.toFixed(2)}</Text>
          <View style={styles.balanceSubInfo}>
            <Text style={styles.balanceToken}>{balance.toFixed(6)} MOVE</Text>
            <View style={styles.percentBadge}>
              <Ionicons name="trending-up" size={12} color={Colors.success} />
              <Text style={styles.percentText}>{percentChange}%</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Deposit' as never)}
          >
            <View style={[styles.actionCircle, { backgroundColor: Colors.primary }]}>
              <Ionicons name="arrow-up" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Deposit' as never)}
          >
            <View style={[styles.actionCircle, { backgroundColor: Colors.primary }]}>
              <Ionicons name="arrow-down" size={24} color="#FFF" />
            </View>
            <Text style={styles.actionLabel}>Receive</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {positions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No active positions</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('BasketBuilder' as never)}
              >
                <Text style={styles.createButtonText}>Create Position</Text>
              </TouchableOpacity>
            </View>
          ) : (
            positions.map((position: any, index: number) => (
              <TouchableOpacity 
                key={index} 
                style={styles.positionCard}
                onPress={() => navigation.navigate('Portfolio' as never)}
              >
                <View style={styles.positionHeader}>
                  <View style={styles.positionIcon}>
                    <Ionicons 
                      name={position.type === 'Long' ? 'trending-up' : 'trending-down'} 
                      size={20} 
                      color={position.type === 'Long' ? Colors.green : Colors.red} 
                    />
                  </View>
                  <View style={styles.positionInfo}>
                    <Text style={styles.positionTitle}>{position.type} Position #{position.id}</Text>
                    <Text style={styles.positionSubtitle}>
                      {position.leverage}x • {position.assets.map((a: any) => `${a.symbol} ${a.weight}%`).join(' • ')}
                    </Text>
                  </View>
                  <View style={styles.positionPnL}>
                    <Text style={[
                      styles.pnlAmount, 
                      { color: position.pnl >= 0 ? Colors.success : Colors.error }
                    ]}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  walletName: {
    ...Typography.h3,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
    marginRight: Spacing.xs,
  },
  networkText: {
    ...Typography.bodySmall,
  },
  balanceCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  balanceSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  balanceToken: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#DCFCE7',
    borderRadius: BorderRadius.sm,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.medium,
  },
  actionLabel: {
    ...Typography.label,
    color: Colors.text,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.small,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  positionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  positionInfo: {
    flex: 1,
  },
  positionTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  positionSubtitle: {
    ...Typography.caption,
  },
  positionPnL: {
    alignItems: 'flex-end',
  },
  pnlAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function DashboardScreenWithNav() {
  return (
    <View style={{ flex: 1 }}>
      <DashboardScreen />
      <BottomTabNavigator />
    </View>
  );
}
