import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analysisApi, AnalysisSummary } from '../../api/analysis';

const CACHE_STORAGE_KEY = 'zevrae_admin_analysis_cache_v1';

function loadCachedAnalysis(): { summary: AnalysisSummary | null; lastFetched: number | null } {
  if (typeof window === 'undefined') return { summary: null, lastFetched: null };
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return { summary: null, lastFetched: null };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        summary: parsed.summary || null,
        lastFetched: typeof parsed.lastFetched === 'number' ? parsed.lastFetched : null,
      };
    }
  } catch (err) {
    console.warn('Failed to parse cached analysis from localStorage:', err);
  }
  return { summary: null, lastFetched: null };
}

function saveCachedAnalysis(summary: AnalysisSummary | null, lastFetched: number) {
  if (typeof window === 'undefined' || !summary) return;
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ summary, lastFetched })
    );
  } catch (err) {
    console.warn('Failed to save analysis to localStorage:', err);
  }
}

export interface AnalysisState {
  summary: AnalysisSummary | null;
  loading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialCached = loadCachedAnalysis();

const initialState: AnalysisState = {
  summary: initialCached.summary,
  loading: initialCached.summary === null,
  isSyncing: false,
  error: null,
  lastFetched: initialCached.lastFetched,
};

export const fetchAnalysisThunk = createAsyncThunk<
  AnalysisSummary,
  { force?: boolean } | void,
  { rejectValue: string }
>('analysis/fetchSummary', async (_, { rejectWithValue }) => {
  try {
    const data = await analysisApi.summary();
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || err?.message || 'Could not load demand analytics.'
    );
  }
});

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    hydrateAnalysisFromStorage(state) {
      const cached = loadCachedAnalysis();
      if (cached.summary) {
        state.summary = cached.summary;
        state.lastFetched = cached.lastFetched;
        state.loading = false;
      }
    },
    clearAnalysisError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAnalysisThunk.pending, state => {
        state.isSyncing = true;
        if (!state.summary) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAnalysisThunk.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loading = false;
        state.isSyncing = false;
        state.lastFetched = Date.now();
        state.error = null;
        saveCachedAnalysis(state.summary, state.lastFetched);
      })
      .addCase(fetchAnalysisThunk.rejected, (state, action) => {
        state.loading = false;
        state.isSyncing = false;
        state.error = action.payload || 'Failed to sync analysis with backend.';
      });
  },
});

export const { hydrateAnalysisFromStorage, clearAnalysisError } = analysisSlice.actions;

export default analysisSlice.reducer;
