import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import walletReducer from './slices/walletSlice';
import transactionReducer from './slices/transactionSlice';
import scheduledPaymentReducer from './slices/scheduledPaymentSlice';
import basketReducer from './slices/basketSlice';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
  wallet: walletReducer,
  transaction: transactionReducer,
  scheduledPayment: scheduledPaymentReducer,
  basket: basketReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
