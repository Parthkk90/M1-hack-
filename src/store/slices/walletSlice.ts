import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {WalletAccount} from '@features/wallet/domain/entities/WalletAccount';
import {walletRepository} from '@features/wallet/data/repositories/WalletRepositoryImpl';

interface WalletState {
  currentWallet: WalletAccount | null;
  loading: boolean;
  error: string | null;
  isInitializing: boolean;
}

const initialState: WalletState = {
  currentWallet: null,
  loading: false,
  error: null,
  isInitializing: false,
};

// Async thunks
export const createWallet = createAsyncThunk(
  'wallet/create',
  async (password: string) => {
    return await walletRepository.createWallet({password});
  },
);

export const importWallet = createAsyncThunk(
  'wallet/import',
  async (params: {mnemonic: string; password: string}) => {
    return await walletRepository.importWallet(params);
  },
);

export const loadCurrentWallet = createAsyncThunk(
  'wallet/loadCurrent',
  async () => {
    return await walletRepository.getCurrentWallet();
  },
);

export const initializeWalletOnChain = createAsyncThunk(
  'wallet/initializeOnChain',
  async (privateKey: string) => {
    return await walletRepository.initializeWalletOnChain(privateKey);
  },
);

export const refreshBalance = createAsyncThunk(
  'wallet/refreshBalance',
  async (address: string) => {
    return await walletRepository.getBalance(address);
  },
);

export const sendCoins = createAsyncThunk(
  'wallet/sendCoins',
  async (params: {privateKey: string; recipientAddress: string; amount: string}) => {
    return await walletRepository.sendCoins(params);
  },
);

export const deleteWallet = createAsyncThunk('wallet/delete', async () => {
  return await walletRepository.deleteWallet();
});

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearWallet: state => {
      state.currentWallet = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Create wallet
    builder
      .addCase(createWallet.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWallet = action.payload;
      })
      .addCase(createWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create wallet';
      });

    // Import wallet
    builder
      .addCase(importWallet.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWallet = action.payload;
      })
      .addCase(importWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to import wallet';
      });

    // Load current wallet
    builder
      .addCase(loadCurrentWallet.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCurrentWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWallet = action.payload;
      })
      .addCase(loadCurrentWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load wallet';
      });

    // Initialize wallet on-chain
    builder
      .addCase(initializeWalletOnChain.pending, state => {
        state.isInitializing = true;
        state.error = null;
      })
      .addCase(initializeWalletOnChain.fulfilled, state => {
        state.isInitializing = false;
        if (state.currentWallet) {
          state.currentWallet.isInitialized = true;
        }
      })
      .addCase(initializeWalletOnChain.rejected, (state, action) => {
        state.isInitializing = false;
        state.error = action.error.message || 'Failed to initialize wallet';
      });

    // Refresh balance
    builder
      .addCase(refreshBalance.fulfilled, (state, action) => {
        if (state.currentWallet) {
          state.currentWallet.balance = action.payload;
        }
      });

    // Send coins
    builder
      .addCase(sendCoins.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendCoins.fulfilled, state => {
        state.loading = false;
      })
      .addCase(sendCoins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send coins';
      });

    // Delete wallet
    builder
      .addCase(deleteWallet.fulfilled, state => {
        state.currentWallet = null;
        state.error = null;
      });
  },
});

export const {clearError, clearWallet} = walletSlice.actions;
export default walletSlice.reducer;
