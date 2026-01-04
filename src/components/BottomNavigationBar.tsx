import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Colors, Spacing, FontSizes} from '@core/theme/theme';

interface BottomNavigationBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const tabs = [
    {
      id: 'Home',
      label: 'Home',
      icon: 'home',
      iconActive: 'home',
    },
    {
      id: 'Markets',
      label: 'Markets',
      icon: 'chart-line',
      iconActive: 'chart-line',
    },
    {
      id: 'Bundles',
      label: 'Bundles',
      icon: 'lightning-bolt',
      iconActive: 'lightning-bolt',
    },
    {
      id: 'Schedule',
      label: 'Schedule',
      icon: 'calendar-blank',
      iconActive: 'calendar',
    },
    {
      id: 'Profile',
      label: 'Profile',
      icon: 'account-outline',
      iconActive: 'account',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onNavigate(tab.id)}
            activeOpacity={0.7}>
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <MaterialCommunityIcons
                name={(isActive ? tab.iconActive : tab.icon) as any}
                size={24}
                color={isActive ? Colors.primary : Colors.text.secondary}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.sm,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  iconContainer: {
    marginBottom: 4,
  },
  iconContainerActive: {
    transform: [{scale: 1.1}],
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default BottomNavigationBar;
