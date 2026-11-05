import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardSummaryRequest } from '../../services/treeService';
import type { DashboardSummary } from '../../types';

/** Cache TTL in milliseconds — skip re-fetch if data is fresher than this */
const CACHE_TTL_MS = 60_000;

interface DashboardState {
  summary: DashboardSummary | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: DashboardState = {
  summary: null,
  status: 'idle',
  error: null,
  lastFetched: null,
};

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { getState }) => {
    const state = (getState() as { dashboard: DashboardState }).dashboard;
    // Use cached data if fresh enough
    if (state.summary && state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL_MS) {
      return state.summary;
    }
    const response = await getDashboardSummaryRequest();
    return response.data!;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    invalidateCache(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch dashboard summary';
      });
  },
});

export const { invalidateCache: invalidateDashboardCache } = dashboardSlice.actions;
export default dashboardSlice.reducer;
