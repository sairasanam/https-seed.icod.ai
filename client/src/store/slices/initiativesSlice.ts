import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getInitiativesRequest,
  createInitiativeRequest,
  updateInitiativeRequest,
  deleteInitiativeRequest,
  archiveInitiativeRequest,
  addTaskRequest,
  toggleTaskRequest,
  removeTaskRequest,
  getTemplatesRequest,
  createFromTemplateRequest,
} from '../../services/initiativeService';
import type { Initiative } from '../../types';

/** Cache TTL in milliseconds — skip re-fetch if data is fresher than this */
const CACHE_TTL_MS = 60_000;

interface InitiativesState {
  items: Initiative[];
  templates: Initiative[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: InitiativesState = {
  items: [],
  templates: [],
  status: 'idle',
  error: null,
  lastFetched: null,
};

export const fetchInitiatives = createAsyncThunk(
  'initiatives/fetchAll',
  async (params: { status?: string; search?: string; sort?: string; template?: string } | undefined, { getState }) => {
    // Only use cache for default (no-filter) requests
    if (!params || (!params.status && !params.search && !params.sort && !params.template)) {
      const state = (getState() as { initiatives: InitiativesState }).initiatives;
      if (state.items.length > 0 && state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL_MS) {
        return state.items;
      }
    }
    const response = await getInitiativesRequest(params);
    return response.data || [];
  }
);

export const addInitiative = createAsyncThunk(
  'initiatives/add',
  async (initiative: Partial<Initiative>) => {
    const response = await createInitiativeRequest(initiative);
    return response.data!;
  }
);

export const editInitiative = createAsyncThunk(
  'initiatives/edit',
  async ({ id, data }: { id: string; data: Partial<Initiative> }) => {
    const response = await updateInitiativeRequest(id, data);
    return response.data!;
  }
);

export const removeInitiative = createAsyncThunk(
  'initiatives/remove',
  async (id: string) => {
    await deleteInitiativeRequest(id);
    return id;
  }
);

export const archiveInitiative = createAsyncThunk(
  'initiatives/archive',
  async (id: string) => {
    const response = await archiveInitiativeRequest(id);
    return response.data!;
  }
);

export const addTask = createAsyncThunk(
  'initiatives/addTask',
  async ({ initiativeId, title }: { initiativeId: string; title: string }) => {
    const response = await addTaskRequest(initiativeId, title);
    return response.data!;
  }
);

export const toggleTask = createAsyncThunk(
  'initiatives/toggleTask',
  async ({ initiativeId, taskId }: { initiativeId: string; taskId: string }) => {
    const response = await toggleTaskRequest(initiativeId, taskId);
    return response.data!;
  }
);

export const removeTask = createAsyncThunk(
  'initiatives/removeTask',
  async ({ initiativeId, taskId }: { initiativeId: string; taskId: string }) => {
    const response = await removeTaskRequest(initiativeId, taskId);
    return response.data!;
  }
);

export const fetchTemplates = createAsyncThunk(
  'initiatives/fetchTemplates',
  async () => {
    const response = await getTemplatesRequest();
    return response.data || [];
  }
);

export const createFromTemplate = createAsyncThunk(
  'initiatives/createFromTemplate',
  async (templateId: string) => {
    const response = await createFromTemplateRequest(templateId);
    return response.data!;
  }
);

const initiativesSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    invalidateCache(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitiatives.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInitiatives.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchInitiatives.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch initiatives';
      })
      .addCase(addInitiative.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.lastFetched = null;
      })
      .addCase(editInitiative.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(removeInitiative.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
        state.lastFetched = null;
      })
      .addCase(archiveInitiative.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(toggleTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
      })
      .addCase(createFromTemplate.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.lastFetched = null;
      });
  },
});

export const { invalidateCache: invalidateInitiativesCache } = initiativesSlice.actions;
export default initiativesSlice.reducer;
