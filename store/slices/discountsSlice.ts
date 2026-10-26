import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { discountsApi, Discount } from '../../api/discounts';

const CACHE_STORAGE_KEY = 'zevrae_admin_discounts_cache_v1';

function loadCachedDiscounts(): { discounts: Discount[]; lastFetched: number | null } {
  if (typeof window === 'undefined') return { discounts: [], lastFetched: null };
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return { discounts: [], lastFetched: null };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.discounts)) {
      return {
        discounts: parsed.discounts,
        lastFetched: typeof parsed.lastFetched === 'number' ? parsed.lastFetched : null,
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached discounts from localStorage:', err);
  }
  return { discounts: [], lastFetched: null };
}

function saveCachedDiscounts(discounts: Discount[], lastFetched: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ discounts, lastFetched })
    );
  } catch (err) {
    console.warn('Failed to save discounts to localStorage:', err);
  }
}

export interface DiscountsState {
  discounts: Discount[];
  loading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialCached = loadCachedDiscounts();

const initialState: DiscountsState = {
  discounts: initialCached.discounts,
  loading: initialCached.discounts.length === 0,
  isSyncing: false,
  error: null,
  lastFetched: initialCached.lastFetched,
};

export const fetchDiscountsThunk = createAsyncThunk<
  Discount[],
  { force?: boolean } | void,
  { rejectValue: string }
>('discounts/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await discountsApi.list();
    return data || [];
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Could not load discounts.'
    );
  }
});

export const discountsSlice = createSlice({
  name: 'discounts',
  initialState,
  reducers: {
    hydrateDiscountsFromStorage(state) {
      const cached = loadCachedDiscounts();
      if (cached.discounts.length > 0) {
        state.discounts = cached.discounts;
        state.lastFetched = cached.lastFetched;
        state.loading = false;
      }
    },
    upsertDiscount(state, action: PayloadAction<Discount>) {
      const idx = state.discounts.findIndex(d => d.id === action.payload.id);
      if (idx >= 0) {
        state.discounts[idx] = action.payload;
      } else {
        state.discounts.unshift(action.payload);
      }
      saveCachedDiscounts(state.discounts, state.lastFetched || Date.now());
    },
    removeDiscount(state, action: PayloadAction<string>) {
      state.discounts = state.discounts.filter(d => d.id !== action.payload);
      saveCachedDiscounts(state.discounts, state.lastFetched || Date.now());
    },
    toggleDiscountStatusLocally(state, action: PayloadAction<string>) {
      const discount = state.discounts.find(d => d.id === action.payload);
      if (discount) {
        discount.status = discount.status === 'Active' ? 'Expired' : 'Active';
        saveCachedDiscounts(state.discounts, state.lastFetched || Date.now());
      }
    },
    clearDiscountsError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDiscountsThunk.pending, state => {
        state.isSyncing = true;
        if (state.discounts.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDiscountsThunk.fulfilled, (state, action) => {
        state.discounts = action.payload;
        state.loading = false;
        state.isSyncing = false;
        state.lastFetched = Date.now();
        state.error = null;
        saveCachedDiscounts(state.discounts, state.lastFetched);
      })
      .addCase(fetchDiscountsThunk.rejected, (state, action) => {
        state.loading = false;
        state.isSyncing = false;
        state.error = action.payload || 'Failed to sync discounts with backend.';
      });
  },
});

export const {
  hydrateDiscountsFromStorage,
  upsertDiscount,
  removeDiscount,
  toggleDiscountStatusLocally,
  clearDiscountsError,
} = discountsSlice.actions;

export default discountsSlice.reducer;
