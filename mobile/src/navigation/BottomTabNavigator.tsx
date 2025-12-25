import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../theme';

interface TabButtonProps {
  icon: string;
  label: string;
  routeName: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onPress }) => (
  <TouchableOpacity style={styles.tabButton} onPress={onPress}>
    <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>{icon}</Text>
    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

export default function BottomTabNavigator() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const currentRoute = route.name;

  const tabs = [
    { icon: '🏠', label: 'Home', routeName: 'Dashboard' },
    { icon: '�', label: 'Markets', routeName: 'Market' },
    { icon: '📦', label: 'Bundles', routeName: 'BasketBuilder' },
    { icon: '📅', label: 'Schedule', routeName: 'Schedule' },
    { icon: '👤', label: 'Profile', routeName: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.routeName}
          icon={tab.icon}
          label={tab.label}
          routeName={tab.routeName}
          isActive={currentRoute === tab.routeName}
          onPress={() => navigation.navigate(tab.routeName)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
