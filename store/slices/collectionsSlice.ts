import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collectionsApi, Collection } from '../../api/collections';
import { productsApi } from '../../api/products';

const CACHE_STORAGE_KEY = 'zevrae_admin_collections_cache_v1';

interface CachedCollectionsData {
  collections: Collection[];
  productCounts: Record<string, number>;
  lastFetched: number | null;
}

function loadCachedCollections(): CachedCollectionsData {
  if (typeof window === 'undefined') return { collections: [], productCounts: {}, lastFetched: null };
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return { collections: [], productCounts: {}, lastFetched: null };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.collections)) {
      return {
        collections: parsed.collections,
        productCounts: parsed.productCounts || {},
        lastFetched: typeof parsed.lastFetched === 'number' ? parsed.lastFetched : null,
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached collections from localStorage:', err);
  }
  return { collections: [], productCounts: {}, lastFetched: null };
}

function saveCachedCollections(collections: Collection[], productCounts: Record<string, number>, lastFetched: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ collections, productCounts, lastFetched })
    );
  } catch (err) {
    console.warn('Failed to save collections to localStorage:', err);
  }
}

export interface CollectionsState {
  collections: Collection[];
  productCounts: Record<string, number>;
  loading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialCached = loadCachedCollections();

const initialState: CollectionsState = {
  collections: initialCached.collections,
  productCounts: initialCached.productCounts,
  loading: initialCached.collections.length === 0,
  isSyncing: false,
  error: null,
  lastFetched: initialCached.lastFetched,
};

export const fetchCollectionsThunk = createAsyncThunk<
  { collections: Collection[]; productCounts: Record<string, number> },
  { force?: boolean } | void,
  { rejectValue: string }
>('collections/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await collectionsApi.list();
    const collections = data || [];
    const counts: Record<string, number> = {};

    await Promise.all(
      collections.map(async c => {
        try {
          const res = await productsApi.list({ collection: c.id, limit: 1 });
          counts[c.id] = res?.pagination?.total ?? 0;
        } catch {
          counts[c.id] = 0;
        }
      })
    );

    return { collections, productCounts: counts };
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Could not load collections.'
    );
  }
});

export const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    hydrateCollectionsFromStorage(state) {
      const cached = loadCachedCollections();
      if (cached.collections.length > 0) {
        state.collections = cached.collections;
        state.productCounts = cached.productCounts;
        state.lastFetched = cached.lastFetched;
        state.loading = false;
      }
    },
    upsertCollection(state, action: PayloadAction<Collection>) {
      const idx = state.collections.findIndex(c => c.id === action.payload.id);
      if (idx >= 0) {
        state.collections[idx] = action.payload;
      } else {
        state.collections.unshift(action.payload);
      }
      saveCachedCollections(state.collections, state.productCounts, state.lastFetched || Date.now());
    },
    removeCollection(state, action: PayloadAction<string>) {
      state.collections = state.collections.filter(c => c.id !== action.payload);
      const newCounts = { ...state.productCounts };
      delete newCounts[action.payload];
      state.productCounts = newCounts;
      saveCachedCollections(state.collections, state.productCounts, state.lastFetched || Date.now());
    },
    toggleCollectionFeaturedLocally(state, action: PayloadAction<string>) {
      const col = state.collections.find(c => c.id === action.payload);
      if (col) {
        col.featured = !col.featured;
        saveCachedCollections(state.collections, state.productCounts, state.lastFetched || Date.now());
      }
    },
    clearCollectionsError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCollectionsThunk.pending, state => {
        state.isSyncing = true;
        if (state.collections.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchCollectionsThunk.fulfilled, (state, action) => {
        state.collections = action.payload.collections;
        state.productCounts = action.payload.productCounts;
        state.loading = false;
        state.isSyncing = false;
        state.lastFetched = Date.now();
        state.error = null;
        saveCachedCollections(state.collections, state.productCounts, state.lastFetched);
      })
      .addCase(fetchCollectionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.isSyncing = false;
        state.error = action.payload || 'Failed to sync collections with backend.';
      });
  },
});

export const {
  hydrateCollectionsFromStorage,
  upsertCollection,
  removeCollection,
  toggleCollectionFeaturedLocally,
  clearCollectionsError,
} = collectionsSlice.actions;

export default collectionsSlice.reducer;
