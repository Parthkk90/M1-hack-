import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../components/integration';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

interface Transaction {
  type: string;
  date: string;
  amount: string;
  status: 'success' | 'pending' | 'failed';
  hash: string;
  direction: 'sent' | 'received';
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'latest' | 'oldest' | 'thisWeek'>('latest');
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      type: 'Sent MOVE',
      date: '12/13/2025, 4:05 PM',
      amount: '-0.0000002 MOVE',
      status: 'success',
      hash: '0x4720...9749',
      direction: 'sent',
    },
    {
      type: 'Received MOVE',
      date: '12/13/2025, 3:57 PM',
      amount: '+0.0000054 MOVE',
      status: 'success',
      hash: '0x4720...9749',
      direction: 'received',
    },
    {
      type: 'Received MOVE',
      date: '12/13/2025, 3:45 PM',
      amount: '+0.0000060 MOVE',
      status: 'pending',
      hash: '0x4720...9749',
      direction: 'received',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch transaction history
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    // Load transaction history
  }, []);

  const getTransactionIcon = (direction: string) => {
    return direction === 'sent' ? 'arrow-up' : 'arrow-down';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={Colors.success} />;
      case 'failed':
        return <Ionicons name="close-circle" size={20} color={Colors.error} />;
      case 'pending':
        return <Ionicons name="time" size={20} color={Colors.orange} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity>
          <Ionicons name="refresh" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'latest' && styles.tabActive]}
            onPress={() => setActiveTab('latest')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'latest' && styles.tabTextActive
            ]}>
              Latest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'oldest' && styles.tabActive]}
            onPress={() => setActiveTab('oldest')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'oldest' && styles.tabTextActive
            ]}>
              Oldest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'thisWeek' && styles.tabActive]}
            onPress={() => setActiveTab('thisWeek')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'thisWeek' && styles.tabTextActive
            ]}>
              This Week
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaction List */}
        <View style={styles.transactionsList}>
          {transactions.map((transaction, index) => (
            <TouchableOpacity
              key={index}
              style={styles.transactionCard}
              onPress={() => {
                // Navigate to transaction details
              }}
            >
              <View style={[
                styles.transactionIcon,
                {
                  backgroundColor: transaction.direction === 'sent' 
                    ? '#FEE2E2' 
                    : '#DCFCE7'
                }
              ]}>
                <Ionicons
                  name={getTransactionIcon(transaction.direction)}
                  size={24}
                  color={transaction.direction === 'sent' ? Colors.error : Colors.success}
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                <Text style={styles.transactionHash}>{transaction.hash}</Text>
              </View>

              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  {
                    color: transaction.direction === 'sent' 
                      ? Colors.error 
                      : Colors.success
                  }
                ]}>
                  {transaction.amount}
                </Text>
                {getStatusIcon(transaction.status)}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
          </View>
        )}
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
    ...Typography.h2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.text,
  },
  tabText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  transactionsList: {
    gap: Spacing.md,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    ...Typography.caption,
    marginBottom: 2,
  },
  transactionHash: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  transactionAmount: {
    ...Typography.body,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.h3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
