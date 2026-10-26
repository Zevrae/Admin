import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoriesApi, Category } from '../../api/categories';
import { productsApi } from '../../api/products';

const CACHE_STORAGE_KEY = 'zevrae_admin_categories_cache_v1';

interface CachedCategoriesData {
  categories: Category[];
  productCounts: Record<string, number>;
  lastFetched: number | null;
}

function loadCachedCategories(): CachedCategoriesData {
  if (typeof window === 'undefined') return { categories: [], productCounts: {}, lastFetched: null };
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return { categories: [], productCounts: {}, lastFetched: null };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.categories)) {
      return {
        categories: parsed.categories,
        productCounts: parsed.productCounts || {},
        lastFetched: typeof parsed.lastFetched === 'number' ? parsed.lastFetched : null,
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached categories from localStorage:', err);
  }
  return { categories: [], productCounts: {}, lastFetched: null };
}

function saveCachedCategories(categories: Category[], productCounts: Record<string, number>, lastFetched: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ categories, productCounts, lastFetched })
    );
  } catch (err) {
    console.warn('Failed to save categories to localStorage:', err);
  }
}

export interface CategoriesState {
  categories: Category[];
  productCounts: Record<string, number>;
  loading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialCached = loadCachedCategories();

const initialState: CategoriesState = {
  categories: initialCached.categories,
  productCounts: initialCached.productCounts,
  loading: initialCached.categories.length === 0,
  isSyncing: false,
  error: null,
  lastFetched: initialCached.lastFetched,
};

export const fetchCategoriesThunk = createAsyncThunk<
  { categories: Category[]; productCounts: Record<string, number> },
  { force?: boolean } | void,
  { rejectValue: string }
>('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await categoriesApi.list();
    const categories = data || [];
    const counts: Record<string, number> = {};

    await Promise.all(
      categories.map(async c => {
        try {
          const res = await productsApi.list({ category: c.name, limit: 1 });
          counts[c.id] = res?.pagination?.total ?? 0;
        } catch {
          counts[c.id] = 0;
        }
      })
    );

    return { categories, productCounts: counts };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Could not load categories.'
    );
  }
});

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    hydrateCategoriesFromStorage(state) {
      const cached = loadCachedCategories();
      if (cached.categories.length > 0) {
        state.categories = cached.categories;
        state.productCounts = cached.productCounts;
        state.lastFetched = cached.lastFetched;
        state.loading = false;
      }
    },
    upsertCategory(state, action: PayloadAction<Category>) {
      const idx = state.categories.findIndex(c => c.id === action.payload.id);
      if (idx >= 0) {
        state.categories[idx] = action.payload;
      } else {
        state.categories.unshift(action.payload);
      }
      saveCachedCategories(state.categories, state.productCounts, state.lastFetched || Date.now());
    },
    removeCategory(state, action: PayloadAction<string>) {
      state.categories = state.categories.filter(c => c.id !== action.payload);
      const newCounts = { ...state.productCounts };
      delete newCounts[action.payload];
      state.productCounts = newCounts;
      saveCachedCategories(state.categories, state.productCounts, state.lastFetched || Date.now());
    },
    clearCategoriesError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCategoriesThunk.pending, state => {
        state.isSyncing = true;
        if (state.categories.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.productCounts = action.payload.productCounts;
        state.loading = false;
        state.isSyncing = false;
        state.lastFetched = Date.now();
        state.error = null;
        saveCachedCategories(state.categories, state.productCounts, state.lastFetched);
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.isSyncing = false;
        state.error = action.payload || 'Failed to sync categories with backend.';
      });
  },
});

export const {
  hydrateCategoriesFromStorage,
  upsertCategory,
  removeCategory,
  clearCategoriesError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
