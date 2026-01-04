import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  hasWallet: boolean;
  isPinSet: boolean;
  biometricEnabled: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  hasWallet: false,
  isPinSet: false,
  biometricEnabled: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setHasWallet: (state, action: PayloadAction<boolean>) => {
      state.hasWallet = action.payload;
    },
    setIsPinSet: (state, action: PayloadAction<boolean>) => {
      state.isPinSet = action.payload;
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    logout: state => {
      state.isAuthenticated = false;
    },
    resetAuth: () => initialState,
  },
});

export const {
  setAuthenticated,
  setHasWallet,
  setIsPinSet,
  setBiometricEnabled,
  logout,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
