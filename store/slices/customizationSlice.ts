import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customizableGarmentsApi, CustomizableGarment } from '../../api/customization';

const CACHE_STORAGE_KEY = 'zevrae_admin_customization_cache_v1';

function loadCachedGarments(): { garments: CustomizableGarment[]; lastFetched: number | null } {
  if (typeof window === 'undefined') return { garments: [], lastFetched: null };
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return { garments: [], lastFetched: null };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.garments)) {
      return {
        garments: parsed.garments,
        lastFetched: typeof parsed.lastFetched === 'number' ? parsed.lastFetched : null,
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached garments from localStorage:', err);
  }
  return { garments: [], lastFetched: null };
}

function saveCachedGarments(garments: CustomizableGarment[], lastFetched: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ garments, lastFetched })
    );
  } catch (err) {
    console.warn('Failed to save garments to localStorage:', err);
  }
}

export interface CustomizationState {
  garments: CustomizableGarment[];
  loading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialCached = loadCachedGarments();

const initialState: CustomizationState = {
  garments: initialCached.garments,
  loading: initialCached.garments.length === 0,
  isSyncing: false,
  error: null,
  lastFetched: initialCached.lastFetched,
};

export const fetchGarmentsThunk = createAsyncThunk<
  CustomizableGarment[],
  { force?: boolean } | void,
  { rejectValue: string }
>('customization/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await customizableGarmentsApi.list();
    return data || [];
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Could not load customizable garments.';
    return rejectWithValue(msg);
  }
});

export const customizationSlice = createSlice({
  name: 'customization',
  initialState,
  reducers: {
    hydrateCustomizationFromStorage(state) {
      const cached = loadCachedGarments();
      if (cached.garments.length > 0) {
        state.garments = cached.garments;
        state.lastFetched = cached.lastFetched;
        state.loading = false;
      }
    },
    upsertGarment(state, action: PayloadAction<CustomizableGarment>) {
      const idx = state.garments.findIndex(g => g.id === action.payload.id);
      if (idx >= 0) {
        state.garments[idx] = action.payload;
      } else {
        state.garments.unshift(action.payload);
      }
      saveCachedGarments(state.garments, state.lastFetched || Date.now());
    },
    removeGarment(state, action: PayloadAction<string>) {
      state.garments = state.garments.filter(g => g.id !== action.payload);
      saveCachedGarments(state.garments, state.lastFetched || Date.now());
    },
    clearCustomizationError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGarmentsThunk.pending, state => {
        state.isSyncing = true;
        if (state.garments.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchGarmentsThunk.fulfilled, (state, action) => {
        state.garments = action.payload;
        state.loading = false;
        state.isSyncing = false;
        state.lastFetched = Date.now();
        state.error = null;
        saveCachedGarments(state.garments, state.lastFetched);
      })
      .addCase(fetchGarmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.isSyncing = false;
        state.error = action.payload || 'Failed to sync garments with backend.';
      });
  },
});

export const {
  hydrateCustomizationFromStorage,
  upsertGarment,
  removeGarment,
  clearCustomizationError,
} = customizationSlice.actions;

export default customizationSlice.reducer;
