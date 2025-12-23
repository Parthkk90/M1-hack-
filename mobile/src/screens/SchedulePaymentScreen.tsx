import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { api } from '../components/integration';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';

export default function SchedulePaymentScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [executionTime, setExecutionTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [repeatInterval, setRepeatInterval] = useState(7);
  const [isRecurring, setIsRecurring] = useState(false);
  const [scheduledPayments, setScheduledPayments] = useState([
    {
      id: 1,
      amount: '0.1000 MOVE',
      recipient: '0x6dfe...F41C',
      interval: 7,
      status: 'Inactive',
      nextExecution: new Date(),
    },
  ]);

  const handleSchedulePayment = async () => {
    try {
      const timestamp = Math.floor(executionTime.getTime() / 1000);
      const result = await api.schedulePayment(
        recipientAddress,
        parseFloat(amount),
        timestamp,
        isRecurring,
        isRecurring ? 0 : undefined, // Daily
        isRecurring ? 0 : undefined // Unlimited
      );
      console.log('Payment scheduled:', result);
      setModalVisible(false);
      // Refresh scheduled payments list
    } catch (error) {
      console.error('Failed to schedule payment:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{fontSize: 24, color: Colors.text}}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={{fontSize: 24, color: Colors.primary}}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity>
              <Text style={{fontSize: 24, color: Colors.text}}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>December 2025</Text>
            <TouchableOpacity>
              <Text style={{fontSize: 24, color: Colors.text}}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            <View style={styles.weekDaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={styles.weekDay}>{day}</Text>
              ))}
            </View>
            {/* Add calendar days here */}
          </View>
        </View>

        {/* Scheduled Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Payments</Text>
          
          {scheduledPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentIcon}>
                  <Text style={{fontSize: 20, color: Colors.primary}}>↻</Text>
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentAmount}>{payment.amount}</Text>
                  <Text style={styles.paymentRecipient}>To: {payment.recipient}</Text>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentDetailText}>INTERVAL</Text>
                    <Text style={styles.paymentDetailText}>PROGRESS</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: payment.status === 'Active' ? '#DCFCE7' : '#FEE2E2' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: payment.status === 'Active' ? Colors.success : Colors.error }
                  ]}>
                    {payment.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Schedule Payment Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Payment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{fontSize: 24, color: Colors.text}}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Date Picker */}
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{fontSize: 20, color: Colors.primary}}>📅</Text>
                <Text style={styles.dateButtonText}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </TouchableOpacity>

              {/* Time Picker */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Execution Time</Text>
                <View style={styles.timePickerContainer}>
                  <View style={styles.timeInput}>
                    <TextInput
                      style={styles.timeValue}
                      value={executionTime.getHours().toString().padStart(2, '0')}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.timeLabel}>Hour</Text>
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  <View style={styles.timeInput}>
                    <TextInput
                      style={styles.timeValue}
                      value={executionTime.getMinutes().toString().padStart(2, '0')}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.timeLabel}>Minute</Text>
                  </View>
                  <View style={styles.amPmToggle}>
                    <TouchableOpacity style={styles.amPmButton}>
                      <Text style={styles.amPmText}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.amPmButton, styles.amPmButtonActive]}>
                      <Text style={[styles.amPmText, styles.amPmTextActive]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.helperText}>
                  Payment will execute at {executionTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>

              {/* Recipient Address */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Recipient Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0x..."
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              {/* Amount */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Amount per Payment</Text>
                <View style={styles.amountInput}>
                  <TextInput
                    style={styles.amountValue}
                    placeholder="0.0"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.textLight}
                  />
                  <Text style={styles.amountCurrency}>MOVE</Text>
                </View>
              </View>

              {/* Repeat Interval */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Repeat Every (days)</Text>
                <View style={styles.repeatInput}>
                  <TextInput
                    style={styles.repeatValue}
                    value={repeatInterval.toString()}
                    onChangeText={(text) => setRepeatInterval(parseInt(text) || 0)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.repeatLabel}>days</Text>
                </View>
              </View>

              {/* Create Button */}
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleSchedulePayment}
              >
                <Text style={styles.createButtonText}>Schedule Payment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date and Time pickers would go here - requires @react-native-community/datetimepicker */}
      {/* Install with: npm install @react-native-community/datetimepicker */}
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
  calendarCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  calendarTitle: {
    ...Typography.h3,
  },
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  todayButtonText: {
    ...Typography.label,
  },
  calendarGrid: {
    marginTop: Spacing.md,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  weekDay: {
    ...Typography.caption,
    width: 40,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentRecipient: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  paymentDetails: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  paymentDetailText: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  statusText: {
    ...Typography.label,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  dateButtonText: {
    ...Typography.body,
    marginLeft: Spacing.md,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  timeInput: {
    alignItems: 'center',
    flex: 1,
  },
  timeValue: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  timeLabel: {
    ...Typography.caption,
  },
  timeSeparator: {
    ...Typography.h2,
    marginHorizontal: Spacing.sm,
  },
  amPmToggle: {
    flexDirection: 'row',
    marginLeft: Spacing.md,
  },
  amPmButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  amPmButtonActive: {
    backgroundColor: Colors.primary,
  },
  amPmText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  amPmTextActive: {
    color: '#FFF',
  },
  helperText: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Typography.body,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  amountValue: {
    flex: 1,
    ...Typography.h2,
  },
  amountCurrency: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  repeatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  repeatValue: {
    flex: 1,
    ...Typography.h2,
  },
  repeatLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.medium,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
