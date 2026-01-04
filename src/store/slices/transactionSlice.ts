import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Transaction} from '@features/wallet/domain/entities/Transaction';
import {transactionRepository} from '@features/wallet/data/repositories/TransactionRepositoryImpl';

interface TransactionState {
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  pendingTransactions: [],
  loading: false,
  error: null,
};

// Async thunks
export const loadTransactionHistory = createAsyncThunk(
  'transaction/loadHistory',
  async (params: {address: string; limit?: number; offset?: number}) => {
    return await transactionRepository.getTransactionHistory(params);
  },
);

export const loadPendingTransactions = createAsyncThunk(
  'transaction/loadPending',
  async (address: string) => {
    return await transactionRepository.getPendingTransactions(address);
  },
);

export const getTransactionByHash = createAsyncThunk(
  'transaction/getByHash',
  async (hash: string) => {
    return await transactionRepository.getTransactionByHash(hash);
  },
);

// Slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearTransactions: state => {
      state.transactions = [];
      state.pendingTransactions = [];
    },
  },
  extraReducers: builder => {
    // Load transaction history
    builder
      .addCase(loadTransactionHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(loadTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load transactions';
      });

    // Load pending transactions
    builder
      .addCase(loadPendingTransactions.fulfilled, (state, action) => {
        state.pendingTransactions = action.payload;
      });

    // Get transaction by hash
    builder
      .addCase(getTransactionByHash.fulfilled, (state, action) => {
        // Update transaction in the list if it exists
        const index = state.transactions.findIndex(
          tx => tx.hash === action.payload.hash,
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      });
  },
});

export const {clearError, clearTransactions} = transactionSlice.actions;
export default transactionSlice.reducer;
