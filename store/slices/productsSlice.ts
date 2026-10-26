import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsApi, Product } from '../../api/products';

export interface StockItem {
  size: string;
  quantity: number;
  _rowId?: number;
}

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  collections: string[];
  category: string;
  subcategory: string;
  price: number;
  compare_price: number | null;
  discount: number | null;
  inventory_mode: 'size' | 'nosize';
  stock_quantity: StockItem[];
  in_stock: boolean;
  images: string[];
  status: string;
  is_deleted?: boolean;
  created_at: string;
}

export function productToDbProduct(p: Product): DbProduct {
  const sizeStock = p.size_stock || {};
  const inventory_mode = p.inventory_mode || (p.sizes && p.sizes.length > 0 ? 'size' : 'nosize');
  const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : Object.keys(sizeStock);
  const stock_quantity: StockItem[] = sizes.map(size => ({
    size,
    quantity: sizeStock[size] ?? 0,
  }));
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    collections: p.collections || [],
    category: p.category,
    subcategory: p.subcategory,
    price: p.price,
    compare_price: p.compare_price ?? null,
    discount: p.discount ?? null,
    inventory_mode,
    stock_quantity,
    in_stock: stock_quantity.some(s => s.quantity > 0) || stock_quantity.length === 0,
    images: p.images || [],
    status: p.status,
    is_deleted: p.is_deleted,
    created_at: p.created_at,
  };
}

const CACHE_STORAGE_KEY = 'zevrae_admin_products_cache_v1';

function loadCachedProducts(): { items: DbProduct[]; lastFetched: number | null } {
  if (typeof window === 'undefined') return { items: [], lastFetched: null };
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return { items: [], lastFetched: null };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.items)) {
      return {
        items: parsed.items,
        lastFetched: typeof parsed.lastFetched === 'number' ? parsed.lastFetched : null,
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached products from localStorage:', err);
  }
  return { items: [], lastFetched: null };
}

function saveCachedProducts(items: DbProduct[], lastFetched: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ items, lastFetched })
    );
  } catch (err) {
    console.warn('Failed to save products to localStorage:', err);
  }
}

export interface ProductsState {
  items: DbProduct[];
  loading: boolean;      // Only true on cold start when no cache exists
  isSyncing: boolean;    // True during silent background revalidation
  error: string | null;
  lastFetched: number | null;
}

const initialCached = loadCachedProducts();

const initialState: ProductsState = {
  items: initialCached.items,
  loading: initialCached.items.length === 0,
  isSyncing: false,
  error: null,
  lastFetched: initialCached.lastFetched,
};

export const fetchDbProductsThunk = createAsyncThunk<
  DbProduct[],
  { force?: boolean } | void,
  { rejectValue: string }
>('products/fetchAll', async (_, { rejectWithValue }) => {
  try {
    let allProducts: DbProduct[] = [];
    let currentPage = 1;
    const MAX_PAGES = 300;

    // 1. Fetch first page to acquire initial items and total pages
    const firstRes: any = await productsApi.list({ limit: 100, page: 1 });
    const firstItems = firstRes?.data || [];
    const pagination = firstRes?.pagination;

    if (firstItems.length > 0) {
      allProducts = firstItems.map((item: any) => productToDbProduct(item));
    }

    const totalPages =
      pagination && typeof pagination.pages === 'number'
        ? Math.min(pagination.pages, MAX_PAGES)
        : firstItems.length === 100
        ? 2
        : 1;

    // 2. Fetch remaining pages in parallel batches of 4 for maximum speed
    if (totalPages > 1) {
      const remainingPages: number[] = [];
      for (let p = 2; p <= totalPages; p++) {
        remainingPages.push(p);
      }

      const BATCH_SIZE = 4;
      for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
        const batch = remainingPages.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          batch.map(pageNum => productsApi.list({ limit: 100, page: pageNum }))
        );

        for (const res of batchResults as any[]) {
          const items = res?.data || [];
          if (items.length > 0) {
            allProducts = [
              ...allProducts,
              ...items.map((item: any) => productToDbProduct(item)),
            ];
          }
        }
      }
    }

    return allProducts;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Could not load products.'
    );
  }
});

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      const cached = loadCachedProducts();
      if (cached.items.length > 0) {
        state.items = cached.items;
        state.lastFetched = cached.lastFetched;
        state.loading = false;
      }
    },
    upsertProduct(state, action: PayloadAction<DbProduct>) {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
      saveCachedProducts(state.items, state.lastFetched || Date.now());
    },
    removeProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter(p => p.id !== action.payload);
      saveCachedProducts(state.items, state.lastFetched || Date.now());
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDbProductsThunk.pending, state => {
        state.isSyncing = true;
        // Only trigger full blocking loading if we have zero items
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDbProductsThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.isSyncing = false;
        state.lastFetched = Date.now();
        state.error = null;
        saveCachedProducts(state.items, state.lastFetched);
      })
      .addCase(fetchDbProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.isSyncing = false;
        state.error = action.payload || 'Failed to sync products with backend.';
      });
  },
});

export const { hydrateFromStorage, upsertProduct, removeProduct, clearError } =
  productsSlice.actions;

export default productsSlice.reducer;
