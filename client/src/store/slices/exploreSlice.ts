import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getExploreItemsRequest, getCategoriesRequest, type ExploreFilters } from '../../services/exploreService';
import type { ContentLibraryItem } from '../../types';

interface ExploreState {
  items: ContentLibraryItem[];
  categories: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ExploreState = {
  items: [],
  categories: [],
  status: 'idle',
  error: null,
};

export const fetchExploreItems = createAsyncThunk(
  'explore/fetchItems',
  async (filters?: ExploreFilters) => {
    const response = await getExploreItemsRequest(filters);
    return response.data || [];
  }
);

export const fetchCategories = createAsyncThunk('explore/fetchCategories', async () => {
  const response = await getCategoriesRequest();
  return response.data || [];
});

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExploreItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExploreItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExploreItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch explore items';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default exploreSlice.reducer;
