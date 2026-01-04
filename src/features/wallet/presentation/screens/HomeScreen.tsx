import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {Colors, Spacing, BorderRadius, FontSizes} from '@core/theme/theme';
import {RootState, AppDispatch} from '@/store';
import {loadCurrentWallet, refreshBalance} from '@/store/slices/walletSlice';
import {loadTransactionHistory} from '@/store/slices/transactionSlice';

const HomeScreen = ({navigation}: any) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // MVVM Pattern: ViewModel is Redux slice
  const {currentWallet, loading, error} = useSelector(
    (state: RootState) => state.wallet,
  );
  const {transactions} = useSelector((state: RootState) => state.transaction);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'latest' | 'oldest' | 'week'>('latest');
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    await dispatch(loadCurrentWallet());
    if (currentWallet) {
      await dispatch(refreshBalance(currentWallet.address));
      await dispatch(
        loadTransactionHistory({
          address: currentWallet.address,
          limit: 10,
        }),
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const formatBalance = (balance: string) => {
    const value = parseFloat(balance) / 100000000; // Convert from Octas
    return value.toFixed(4);
  };

  const formatUSDBalance = (balance: string) => {
    const moveAmount = parseFloat(balance) / 100000000;
    const usdValue = moveAmount * 10; // Mock price, replace with real price feed
    return usdValue.toFixed(2);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getPercentageChange = () => {
    // Mock percentage change, replace with real data
    return '+1.44%';
  };

  const filteredTransactions = transactions.slice(0, 10);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profileIcon}>
              <MaterialCommunityIcons name="account" size={28} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Cresca Wallet</Text>
              <View style={styles.networkBadge}>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>Movement Testnet</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="content-copy" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total balance</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              <MaterialCommunityIcons 
                name={balanceVisible ? 'chevron-down' : 'chevron-up'} 
                size={20} 
                color={Colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.balanceAmount}>
            ${currentWallet ? formatUSDBalance(currentWallet.balance) : '0.00'}
          </Text>
          
          <View style={styles.balanceFooter}>
            <Text style={styles.balanceMove}>
              {currentWallet ? formatBalance(currentWallet.balance) : '0.0000'} MOVE
            </Text>
            <View style={styles.percentageContainer}>
              <MaterialCommunityIcons name="trending-up" size={14} color={Colors.success} />
              <Text style={styles.percentageText}>{getPercentageChange()}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Send')}>
            <LinearGradient
              colors={Colors.gradients.purple}
              style={styles.actionIconContainer}>
              <MaterialCommunityIcons name="arrow-up" size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Receive')}>
            <LinearGradient
              colors={Colors.gradients.purple}
              style={styles.actionIconContainer}>
              <MaterialCommunityIcons name="arrow-down" size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Swap')}>
            <LinearGradient
              colors={Colors.gradients.purple}
              style={styles.actionIconContainer}>
              <MaterialCommunityIcons name="swap-horizontal" size={26} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>Swap</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <TouchableOpacity>
              <MaterialCommunityIcons name="refresh" size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, selectedFilter === 'latest' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('latest')}>
              <Text style={[styles.filterTabText, selectedFilter === 'latest' && styles.filterTabTextActive]}>
                Latest
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterTab, selectedFilter === 'oldest' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('oldest')}>
              <Text style={[styles.filterTabText, selectedFilter === 'oldest' && styles.filterTabTextActive]}>
                Oldest
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterTab, selectedFilter === 'week' && styles.filterTabActive]}
              onPress={() => setSelectedFilter('week')}>
              <Text style={[styles.filterTabText, selectedFilter === 'week' && styles.filterTabTextActive]}>
                This Week
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transaction List */}
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx: any, index: number) => (
              <TouchableOpacity key={index} style={styles.transactionItem}>
                <View style={[
                  styles.transactionIcon,
                  tx.type === 'send' ? styles.transactionIconSent : styles.transactionIconReceived
                ]}>
                  <MaterialCommunityIcons
                    name={tx.type === 'send' ? 'arrow-up' : 'arrow-down'}
                    size={20}
                    color={tx.type === 'send' ? Colors.error : Colors.success}
                  />
                </View>
                
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionType}>
                    {tx.type === 'send' ? 'Sent' : 'Received'} MOVE
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(tx.timestamp).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.transactionAddress}>
                    {formatAddress(tx.type === 'send' ? tx.to : tx.from)}
                  </Text>
                </View>
                
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {color: tx.type === 'send' ? Colors.error : Colors.success},
                    ]}>
                    {tx.type === 'send' ? '-' : '+'}
                    {formatBalance(tx.amount)} MOVE
                  </Text>
                  <View style={tx.status === 'confirmed' ? styles.statusSuccess : styles.statusError}>
                    <MaterialCommunityIcons 
                      name={tx.status === 'confirmed' ? 'check-circle' : 'close-circle'} 
                      size={16} 
                      color={tx.status === 'confirmed' ? Colors.success : Colors.error} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={48} color={Colors.text.disabled} />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          )}
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.network.active,
  },
  networkText: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    letterSpacing: -1,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  balanceMove: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  percentageText: {
    fontSize: FontSizes.sm,
    color: Colors.success,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  transactionSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
  },
  filterTabActive: {
    backgroundColor: Colors.text.primary,
  },
  filterTabText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: Colors.background,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconSent: {
    backgroundColor: Colors.error + '15',
  },
  transactionIconReceived: {
    backgroundColor: Colors.success + '15',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  transactionAddress: {
    fontSize: FontSizes.xs,
    color: Colors.text.disabled,
    fontFamily: 'monospace',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  statusSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusError: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyStateText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.text.disabled,
    marginTop: Spacing.xs,
  },
});

export default HomeScreen;
