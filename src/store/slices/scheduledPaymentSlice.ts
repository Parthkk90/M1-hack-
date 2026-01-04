import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {ScheduledPayment} from '@features/scheduledPayments/domain/entities/ScheduledPayment';
import {scheduledPaymentRepository} from '@features/scheduledPayments/data/repositories/ScheduledPaymentRepositoryImpl';

interface ScheduledPaymentState {
  payments: ScheduledPayment[];
  duePayments: ScheduledPayment[];
  loading: boolean;
  error: string | null;
}

const initialState: ScheduledPaymentState = {
  payments: [],
  duePayments: [],
  loading: false,
  error: null,
};

// Async thunks
export const schedulePayment = createAsyncThunk(
  'scheduledPayment/schedule',
  async (params: {
    privateKey: string;
    recipientAddress: string;
    amount: string;
    executionTime: Date;
    interval?: number;
    description?: string;
  }) => {
    return await scheduledPaymentRepository.schedulePayment(params);
  },
);

export const executeScheduledPayment = createAsyncThunk(
  'scheduledPayment/execute',
  async (params: {privateKey: string; paymentId: string}) => {
    return await scheduledPaymentRepository.executeScheduledPayment(params);
  },
);

export const loadScheduledPayments = createAsyncThunk(
  'scheduledPayment/load',
  async (address: string) => {
    return await scheduledPaymentRepository.getScheduledPayments(address);
  },
);

export const loadDuePayments = createAsyncThunk(
  'scheduledPayment/loadDue',
  async (address: string) => {
    return await scheduledPaymentRepository.getDuePayments(address);
  },
);

// Slice
const scheduledPaymentSlice = createSlice({
  name: 'scheduledPayment',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearPayments: state => {
      state.payments = [];
      state.duePayments = [];
    },
  },
  extraReducers: builder => {
    // Schedule payment
    builder
      .addCase(schedulePayment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(schedulePayment.fulfilled, state => {
        state.loading = false;
      })
      .addCase(schedulePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to schedule payment';
      });

    // Execute scheduled payment
    builder
      .addCase(executeScheduledPayment.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeScheduledPayment.fulfilled, state => {
        state.loading = false;
      })
      .addCase(executeScheduledPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to execute payment';
      });

    // Load scheduled payments
    builder
      .addCase(loadScheduledPayments.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadScheduledPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(loadScheduledPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load payments';
      });

    // Load due payments
    builder
      .addCase(loadDuePayments.fulfilled, (state, action) => {
        state.duePayments = action.payload;
      });
  },
});

export const {clearError, clearPayments} = scheduledPaymentSlice.actions;
export default scheduledPaymentSlice.reducer;
