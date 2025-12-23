import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import LandingScreen from './src/screens/LandingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MarketScreen from './src/screens/MarketScreen';
import WalletScreen from './src/screens/WalletScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import BasketBuilderScreen from './src/screens/BasketBuilderScreen';
import ReviewModal from './src/screens/ReviewModal';
import PositionDetailsScreen from './src/screens/PositionDetailsScreen';
import ClosePositionModal from './src/screens/ClosePositionModal';
import SuccessModal from './src/screens/SuccessModal';
import DepositModal from './src/screens/DepositModal';
import WithdrawModal from './src/screens/WithdrawModal';
import SwapModal from './src/screens/SwapModal';
import SchedulePaymentScreen from './src/screens/SchedulePaymentScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Market" component={MarketScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="BasketBuilder" component={BasketBuilderScreen} />
          <Stack.Screen name="ReviewModal" component={ReviewModal} />
          <Stack.Screen name="PositionDetails" component={PositionDetailsScreen} />
          <Stack.Screen name="ClosePositionModal" component={ClosePositionModal} />
          <Stack.Screen name="SuccessModal" component={SuccessModal} />
          <Stack.Screen name="DepositModal" component={DepositModal} />
          <Stack.Screen name="WithdrawModal" component={WithdrawModal} />
          <Stack.Screen name="SwapModal" component={SwapModal} />
          <Stack.Screen name="Schedule" component={SchedulePaymentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
