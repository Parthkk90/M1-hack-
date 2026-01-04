import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Colors, FontSizes} from '@core/theme/theme';

// Import screens (we'll create these)
import WelcomeScreen from '@features/wallet/presentation/screens/WelcomeScreen';
import CreateWalletScreen from '@features/wallet/presentation/screens/CreateWalletScreen';
import ImportWalletScreen from '@features/wallet/presentation/screens/ImportWalletScreen';
import HomeScreen from '@features/wallet/presentation/screens/HomeScreen';
import SendScreen from '@features/wallet/presentation/screens/SendScreen';
import ReceiveScreen from '@features/wallet/presentation/screens/ReceiveScreen';
import TransactionHistoryScreen from '@features/wallet/presentation/screens/TransactionHistoryScreen';
import ScheduledPaymentsScreen from '@features/scheduledPayments/presentation/screens/ScheduledPaymentsScreen';
import CreateScheduledPaymentScreen from '@features/scheduledPayments/presentation/screens/CreateScheduledPaymentScreen';
import BasketsScreen from '@features/baskets/presentation/screens/BasketsScreen';
import CreateBasketScreen from '@features/baskets/presentation/screens/CreateBasketScreen';
import SettingsScreen from '@features/wallet/presentation/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Markets"
        component={TransactionHistoryScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="chart-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bundles"
        component={BasketsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="lightning-bolt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduledPaymentsScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <MaterialCommunityIcons name={focused ? 'calendar' : 'calendar-blank'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // TODO: Check auth state and wallet existence
  const hasWallet = false; // This should come from Redux store

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {!hasWallet ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
          <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={HomeTabs} />
          <Stack.Screen name="Send" component={SendScreen} />
          <Stack.Screen name="Receive" component={ReceiveScreen} />
          <Stack.Screen name="Swap" component={CreateBasketScreen} />
          <Stack.Screen
            name="TransactionHistory"
            component={TransactionHistoryScreen}
          />
          <Stack.Screen
            name="CreateScheduledPayment"
            component={CreateScheduledPaymentScreen}
          />
          <Stack.Screen name="CreateBasket" component={CreateBasketScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
