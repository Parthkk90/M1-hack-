import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView } from 'react-native';
import { getExplorerTxUrl } from '../config/wallet';

interface Transaction {
  hash: string;
  type: string;
  amount?: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

interface TransactionResultProps {
  transaction: {
    success: boolean;
    transactionHash: string;
    explorerUrl: string;
    message: string;
  };
  onClose: () => void;
}

export const TransactionResult: React.FC<TransactionResultProps> = ({ transaction, onClose }) => {
  const openExplorer = () => {
    Linking.openURL(transaction.explorerUrl);
  };

  return (
    <View style={styles.resultContainer}>
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultIcon}>
            {transaction.success ? '✅' : '❌'}
          </Text>
          <Text style={styles.resultTitle}>
            {transaction.success ? 'Transaction Successful' : 'Transaction Failed'}
          </Text>
        </View>

        <View style={styles.resultBody}>
          <Text style={styles.resultMessage}>{transaction.message}</Text>
          
          <View style={styles.hashContainer}>
            <Text style={styles.hashLabel}>Transaction Hash:</Text>
            <Text style={styles.hashText}>
              {transaction.transactionHash.substring(0, 12)}...
              {transaction.transactionHash.substring(transaction.transactionHash.length - 8)}
            </Text>
          </View>

          <TouchableOpacity style={styles.explorerButton} onPress={openExplorer}>
            <Text style={styles.explorerButtonText}>
              🔍 View on Explorer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const TransactionHistory: React.FC<{ address: string }> = ({ address }) => {
  const [transactions] = useState<Transaction[]>([
    // Sample transactions - in production, fetch from blockchain
    {
      hash: '0xfc9ef597647d290077738a998563914633becae21bed61486fc8287d615d5d91',
      type: 'Initialize Payment Scheduler',
      timestamp: 'Just now',
      status: 'success',
    },
    {
      hash: '0x53ce4b2fa438196286669074afb05b76a0d8875af60e9ea826b00fdde9bed656',
      type: 'Schedule Payment',
      amount: '0.05 MOVE',
      timestamp: '1 min ago',
      status: 'success',
    },
    {
      hash: '0x8ffd7eda368bc1e9076e4d197c10d950ee29a3a65a5690c0e046ccaf7689f796',
      type: 'Initialize Price Oracle',
      timestamp: '2 mins ago',
      status: 'success',
    },
  ]);

  const openTransaction = (hash: string) => {
    const url = getExplorerTxUrl(hash);
    Linking.openURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'pending':
        return '#FFA726';
      case 'failed':
        return '#EF5350';
      default:
        return '#B0B0B0';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Recent Transactions</Text>
      
      <ScrollView style={styles.transactionList}>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((tx, index) => (
            <TouchableOpacity
              key={index}
              style={styles.transactionCard}
              onPress={() => openTransaction(tx.hash)}
            >
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionType}>{tx.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tx.status) }]}>
                  <Text style={styles.statusText}>{tx.status}</Text>
                </View>
              </View>

              {tx.amount && (
                <Text style={styles.transactionAmount}>{tx.amount}</Text>
              )}

              <View style={styles.transactionFooter}>
                <Text style={styles.transactionHash}>
                  {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 6)}
                </Text>
                <Text style={styles.transactionTime}>{tx.timestamp}</Text>
              </View>

              <View style={styles.explorerLink}>
                <Text style={styles.explorerLinkText}>View on Explorer →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  transactionList: {
    maxHeight: 400,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  transactionCard: {
    backgroundColor: '#16213E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  transactionHash: {
    fontSize: 12,
    color: '#808080',
    fontFamily: 'monospace',
  },
  transactionTime: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  explorerLink: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#0F3460',
  },
  explorerLinkText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  // Transaction Result Modal Styles
  resultContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  resultHeader: {
    backgroundColor: '#0F3460',
    padding: 24,
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultBody: {
    padding: 24,
  },
  resultMessage: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 24,
  },
  hashContainer: {
    backgroundColor: '#16213E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  hashLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  hashText: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'monospace',
  },
  explorerButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  explorerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#16213E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
