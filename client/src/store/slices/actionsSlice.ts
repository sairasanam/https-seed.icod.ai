import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getActionsRequest,
  createActionRequest,
  updateActionRequest,
  completeActionRequest,
  undoActionRequest,
  postponeActionRequest,
  dismissActionRequest,
  deleteActionRequest,
  getActivityLogsRequest,
  type GetActionsParams,
} from '../../services/actionService';
import type { Action, ActivityLog } from '../../types';

interface ActionsState {
  items: Action[];
  activityLogs: ActivityLog[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  logsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: GetActionsParams;
}

const initialState: ActionsState = {
  items: [],
  activityLogs: [],
  status: 'idle',
  logsStatus: 'idle',
  error: null,
  filters: {},
};

export const fetchActions = createAsyncThunk(
  'actions/fetchAll',
  async (params?: GetActionsParams) => {
    const response = await getActionsRequest(params);
    return response.data || [];
  }
);

export const addAction = createAsyncThunk(
  'actions/add',
  async (action: Partial<Action>) => {
    const response = await createActionRequest(action);
    return response.data!;
  }
);

export const editAction = createAsyncThunk(
  'actions/edit',
  async ({ id, data }: { id: string; data: Partial<Action> }) => {
    const response = await updateActionRequest(id, data);
    return response.data!;
  }
);

export const completeAction = createAsyncThunk(
  'actions/complete',
  async (id: string) => {
    const response = await completeActionRequest(id);
    return response.data!;
  }
);

export const undoAction = createAsyncThunk(
  'actions/undo',
  async (id: string) => {
    const response = await undoActionRequest(id);
    return response.data!;
  }
);

export const postponeAction = createAsyncThunk(
  'actions/postpone',
  async ({ id, dueDate }: { id: string; dueDate: string }) => {
    const response = await postponeActionRequest(id, dueDate);
    return response.data!;
  }
);

export const dismissAction = createAsyncThunk(
  'actions/dismiss',
  async (id: string) => {
    const response = await dismissActionRequest(id);
    return response.data!;
  }
);

export const removeAction = createAsyncThunk(
  'actions/remove',
  async (id: string) => {
    await deleteActionRequest(id);
    return id;
  }
);

export const fetchActivityLogs = createAsyncThunk(
  'actions/fetchLogs',
  async (params?: { actionId?: string; personId?: string; limit?: number }) => {
    const response = await getActivityLogsRequest(params);
    return response.data || [];
  }
);

const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch actions
      .addCase(fetchActions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchActions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchActions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch actions';
      })
      // Add action
      .addCase(addAction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Edit action
      .addCase(editAction.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Complete action
      .addCase(completeAction.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Undo action
      .addCase(undoAction.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Postpone action
      .addCase(postponeAction.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Dismiss action
      .addCase(dismissAction.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // Remove action
      .addCase(removeAction.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a._id !== action.payload);
      })
      // Fetch activity logs
      .addCase(fetchActivityLogs.pending, (state) => {
        state.logsStatus = 'loading';
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.logsStatus = 'succeeded';
        state.activityLogs = action.payload;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.logsStatus = 'failed';
        state.error = action.error.message || 'Failed to fetch activity logs';
      });
  },
});

export const { setFilters, clearFilters } = actionsSlice.actions;
export default actionsSlice.reducer;
