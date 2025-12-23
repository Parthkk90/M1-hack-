import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/LandingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MarketScreen from '../screens/MarketScreen';
import WalletScreen from '../screens/WalletScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import BasketBuilderScreen from '../screens/BasketBuilderScreen';
import ReviewModalScreen from '../screens/ReviewModalScreen';
import PositionDetailsScreen from '../screens/PositionDetailsScreen';
import ClosePositionModalScreen from '../screens/ClosePositionModalScreen';
import SuccessModalScreen from '../screens/SuccessModalScreen';
import DepositScreen from '../screens/DepositScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import SwapScreen from '../screens/SwapScreen';

export type RootStackParamList = {
  Landing: undefined;
  Dashboard: undefined;
  Market: undefined;
  Wallet: undefined;
  Settings: undefined;
  History: undefined;
  BasketBuilder: undefined;
  ReviewModal: undefined;
  PositionDetails: undefined;
  ClosePositionModal: undefined;
  SuccessModal: undefined;
  Deposit: undefined;
  Withdraw: undefined;
  Swap: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Market" component={MarketScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="BasketBuilder" component={BasketBuilderScreen} />
      <Stack.Screen name="ReviewModal" component={ReviewModalScreen} />
      <Stack.Screen name="PositionDetails" component={PositionDetailsScreen} />
      <Stack.Screen name="ClosePositionModal" component={ClosePositionModalScreen} />
      <Stack.Screen name="SuccessModal" component={SuccessModalScreen} />
      <Stack.Screen name="Deposit" component={DepositScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="Swap" component={SwapScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
