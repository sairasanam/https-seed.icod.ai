import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Example slice — demonstrates the store convention. Extend or replace with
// real domain slices (one file per domain in store/slices/).
interface UiState {
  globalLoading: boolean;
}

const initialState: UiState = {
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const { setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
