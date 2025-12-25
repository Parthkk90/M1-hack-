import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { api } from '../components/integration';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../theme';
import BottomTabNavigator from '../navigation/BottomTabNavigator';

function SchedulePaymentScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [isAM, setIsAM] = useState(true);
  const [scheduledPayments, setScheduledPayments] = useState([
    {
      id: 1,
      amount: '0.1000 MOVE',
      recipient: '0x6dfe...F41C',
      date: '2025-01-15',
      time: '02:00 PM',
      recurring: true,
      status: 'Active',
    },
    {
      id: 2,
      amount: '0.5000 MOVE',
      recipient: '0x8abc...D234',
      date: '2025-01-20',
      time: '10:00 AM',
      recurring: false,
      status: 'Pending',
    },
  ]);

  const handleSchedulePayment = async () => {
    if (!selectedDate || !recipientAddress || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const hour = isAM ? parseInt(selectedHour) : parseInt(selectedHour) + 12;
      const dateTime = new Date(`${selectedDate}T${hour.toString().padStart(2, '0')}:${selectedMinute}:00`);
      const timestamp = Math.floor(dateTime.getTime() / 1000);
      
      const result = await api.schedulePayment(
        recipientAddress,
        parseFloat(amount),
        timestamp,
        isRecurring,
        isRecurring ? 0 : undefined,
        isRecurring ? 0 : undefined
      );
      
      console.log('Payment scheduled:', result);
      
      // Add to local list
      const newPayment = {
        id: scheduledPayments.length + 1,
        amount: `${amount} MOVE`,
        recipient: `${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
        date: selectedDate,
        time: `${selectedHour}:${selectedMinute} ${isAM ? 'AM' : 'PM'}`,
        recurring: isRecurring,
        status: 'Pending',
      };
      setScheduledPayments([...scheduledPayments, newPayment]);
      
      // Reset form
      setModalVisible(false);
      setRecipientAddress('');
      setAmount('');
      setSelectedDate('');
      setIsRecurring(false);
    } catch (error) {
      console.error('Failed to schedule payment:', error);
      alert('Failed to schedule payment');
    }
  };

  const markedDates: any = {};
  scheduledPayments.forEach(payment => {
    markedDates[payment.date] = {
      marked: true,
      dotColor: payment.status === 'Active' ? Colors.green : Colors.primary,
    };
  });
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: Colors.primary,
    };
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule Payments</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: Colors.card,
              calendarBackground: Colors.card,
              textSectionTitleColor: Colors.textSecondary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              dayTextColor: Colors.text,
              textDisabledColor: Colors.textSecondary,
              dotColor: Colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: Colors.primary,
              monthTextColor: Colors.text,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Scheduled Payments List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Payments</Text>
          
          {scheduledPayments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No scheduled payments</Text>
              <Text style={styles.emptySubtext}>Tap + New to schedule a payment</Text>
            </View>
          ) : (
            scheduledPayments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentRow}>
                  <View style={styles.paymentIcon}>
                    <Text style={{fontSize: 24}}>
                      {payment.recurring ? '🔄' : '📅'}
                    </Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentAmount}>{payment.amount}</Text>
                    <Text style={styles.paymentRecipient}>To: {payment.recipient}</Text>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentDate}>{payment.date}</Text>
                      <Text style={styles.paymentTime}> • {payment.time}</Text>
                      {payment.recurring && (
                        <Text style={styles.recurringBadge}> • Recurring</Text>
                      )}
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: payment.status === 'Active' ? Colors.green + '20' : Colors.orange + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: payment.status === 'Active' ? Colors.green : Colors.orange }
                    ]}>
                      {payment.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Schedule Payment Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Payment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Recipient */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipient Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0x..."
                  placeholderTextColor={Colors.textSecondary}
                  value={recipientAddress}
                  onChangeText={setRecipientAddress}
                />
              </View>

              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount (MOVE)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Execution Date</Text>
                <Text style={styles.selectedDateText}>
                  {selectedDate || 'Select a date on calendar'}
                </Text>
              </View>

              {/* Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Execution Time</Text>
                <View style={styles.timeRow}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="12"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={selectedHour}
                    onChangeText={setSelectedHour}
                  />
                  <Text style={styles.timeColon}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="00"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={selectedMinute}
                    onChangeText={setSelectedMinute}
                  />
                  <View style={styles.amPmToggle}>
                    <TouchableOpacity
                      style={[styles.amPmButton, isAM && styles.amPmButtonActive]}
                      onPress={() => setIsAM(true)}
                    >
                      <Text style={[styles.amPmText, isAM && styles.amPmTextActive]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.amPmButton, !isAM && styles.amPmButtonActive]}
                      onPress={() => setIsAM(false)}
                    >
                      <Text style={[styles.amPmText, !isAM && styles.amPmTextActive]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Recurring */}
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.inputLabel}>Recurring Payment</Text>
                  <Text style={styles.switchSubtext}>Repeat daily</Text>
                </View>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: Colors.border, true: Colors.primary + '40' }}
                  thumbColor={isRecurring ? Colors.primary : Colors.textSecondary}
                />
              </View>
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSchedulePayment}
            >
              <Text style={styles.submitButtonText}>Schedule Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomTabNavigator />
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
    padding: Spacing.md,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  calendarCard: {
    margin: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentAmount: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  paymentRecipient: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  paymentTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  recurringBadge: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  modalScroll: {
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 16,
  },
  selectedDateText: {
    ...Typography.body,
    color: selectedDate ? Colors.text : Colors.textSecondary,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  timeColon: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: Spacing.xs,
  },
  amPmToggle: {
    flexDirection: 'row',
    marginLeft: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  amPmButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  amPmButtonActive: {
    backgroundColor: Colors.primary,
  },
  amPmText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  amPmTextActive: {
    color: '#FFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  switchSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function SchedulePaymentScreenWithNav() {
  return <SchedulePaymentScreen />;
}
