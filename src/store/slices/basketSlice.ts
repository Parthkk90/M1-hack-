import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Basket} from '@features/baskets/domain/entities/Basket';
import {basketRepository} from '@features/baskets/data/repositories/BasketRepositoryImpl';

interface BasketState {
  baskets: Basket[];
  loading: boolean;
  error: string | null;
}

const initialState: BasketState = {
  baskets: [],
  loading: false,
  error: null,
};

// Async thunks
export const createBasket = createAsyncThunk(
  'basket/create',
  async (params: {privateKey: string; name: string; initialValue: string}) => {
    return await basketRepository.createBasket(params);
  },
);

export const loadBaskets = createAsyncThunk(
  'basket/load',
  async (address: string) => {
    return await basketRepository.getBaskets(address);
  },
);

export const getBasketById = createAsyncThunk(
  'basket/getById',
  async (params: {address: string; basketId: string}) => {
    return await basketRepository.getBasketById(params.address, params.basketId);
  },
);

// Slice
const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearBaskets: state => {
      state.baskets = [];
    },
  },
  extraReducers: builder => {
    // Create basket
    builder
      .addCase(createBasket.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBasket.fulfilled, state => {
        state.loading = false;
      })
      .addCase(createBasket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create basket';
      });

    // Load baskets
    builder
      .addCase(loadBaskets.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBaskets.fulfilled, (state, action) => {
        state.loading = false;
        state.baskets = action.payload;
      })
      .addCase(loadBaskets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load baskets';
      });

    // Get basket by ID
    builder.addCase(getBasketById.fulfilled, (state, action) => {
      const index = state.baskets.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.baskets[index] = action.payload;
      }
    });
  },
});

export const {clearError, clearBaskets} = basketSlice.actions;
export default basketSlice.reducer;
