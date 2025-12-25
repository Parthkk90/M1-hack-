import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { blockchain } from '../components/integration';
import { WALLET_CONFIG, getExplorerAccountUrl } from '../config/wallet';

export const WalletInfo: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const walletAddress = WALLET_CONFIG.TEST_WALLET_ADDRESS;

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      setLoading(true);
      if (blockchain.isConnected()) {
        const bal = await blockchain.getBalance();
        setBalance(bal);
        setConnected(true);
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const openExplorer = () => {
    const url = getExplorerAccountUrl(walletAddress);
    Linking.openURL(url);
  };

  const copyAddress = () => {
    // In production, implement clipboard copy
    alert('Address: ' + walletAddress);
  };

  const refreshBalance = () => {
    loadBalance();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💼 Wallet</Text>
        <TouchableOpacity onPress={refreshBalance} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance</Text>
        {loading ? (
          <ActivityIndicator color="#4CAF50" />
        ) : (
          <Text style={styles.balanceAmount}>{balance.toFixed(4)} MOVE</Text>
        )}
      </View>

      <View style={styles.addressCard}>
        <Text style={styles.addressLabel}>Wallet Address</Text>
        <TouchableOpacity onPress={copyAddress}>
          <Text style={styles.addressText}>
            {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
          </Text>
        </TouchableOpacity>
        <Text style={styles.fullAddress}>{walletAddress}</Text>
      </View>

      <TouchableOpacity style={styles.explorerButton} onPress={openExplorer}>
        <Text style={styles.explorerButtonText}>
          🔍 View on Movement Explorer
        </Text>
      </TouchableOpacity>

      <View style={styles.networkInfo}>
        <Text style={styles.networkLabel}>Network: </Text>
        <Text style={styles.networkValue}>{WALLET_CONFIG.NETWORK.name}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Send MOVE Tokens</Text>
        <Text style={styles.infoText}>
          Send MOVE tokens to this address to fund your wallet:
        </Text>
        <TouchableOpacity onPress={copyAddress} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>📋 Copy Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
  },
  balanceCard: {
    backgroundColor: '#0F3460',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  addressCard: {
    backgroundColor: '#16213E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  fullAddress: {
    fontSize: 10,
    color: '#808080',
    fontFamily: 'monospace',
  },
  explorerButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  explorerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  networkInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#16213E',
    borderRadius: 8,
  },
  networkLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  networkValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#0F3460',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 12,
  },
  copyButton: {
    backgroundColor: '#16213E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
