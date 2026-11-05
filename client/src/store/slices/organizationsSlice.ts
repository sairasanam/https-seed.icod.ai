import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getOrganizationsRequest,
  createOrganizationRequest,
  updateOrganizationRequest,
  toggleFollowRequest,
  toggleFavoriteRequest,
  deleteOrganizationRequest,
  adminCreateOrganizationRequest,
  adminUpdateOrganizationRequest,
  adminDeleteOrganizationRequest,
  adminSetVerifiedRequest,
} from '../../services/organizationService';
import type { Organization } from '../../types';

/** Cache TTL in milliseconds — skip re-fetch if data is fresher than this */
const CACHE_TTL_MS = 60_000;

interface OrganizationsState {
  items: Organization[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: OrganizationsState = {
  items: [],
  status: 'idle',
  error: null,
  lastFetched: null,
};

export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchAll',
  async (params: { type?: string; search?: string; favorites?: string; sort?: string } | undefined, { getState }) => {
    // Only use cache for default (no-filter) requests
    if (!params || (!params.type && !params.search && !params.favorites && !params.sort)) {
      const state = (getState() as { organizations: OrganizationsState }).organizations;
      if (state.items.length > 0 && state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL_MS) {
        return state.items;
      }
    }
    const response = await getOrganizationsRequest(params);
    return response.data || [];
  }
);

export const addOrganization = createAsyncThunk(
  'organizations/add',
  async (org: Partial<Organization>) => {
    const response = await createOrganizationRequest(org);
    return response.data!;
  }
);

export const editOrganization = createAsyncThunk(
  'organizations/edit',
  async ({ id, data }: { id: string; data: Partial<Organization> }) => {
    const response = await updateOrganizationRequest(id, data);
    return response.data!;
  }
);

export const toggleFollowOrg = createAsyncThunk(
  'organizations/toggleFollow',
  async (id: string) => {
    const response = await toggleFollowRequest(id);
    return response.data!;
  }
);

export const toggleFavoriteOrg = createAsyncThunk(
  'organizations/toggleFavorite',
  async (id: string) => {
    const response = await toggleFavoriteRequest(id);
    return response.data!;
  }
);

export const removeOrganization = createAsyncThunk(
  'organizations/remove',
  async (id: string) => {
    await deleteOrganizationRequest(id);
    return id;
  }
);

// Admin thunks
export const adminAddOrganization = createAsyncThunk(
  'organizations/adminAdd',
  async (org: Partial<Organization> & { userId?: string }) => {
    const response = await adminCreateOrganizationRequest(org);
    return response.data!;
  }
);

export const adminEditOrganization = createAsyncThunk(
  'organizations/adminEdit',
  async ({ id, data }: { id: string; data: Partial<Organization> }) => {
    const response = await adminUpdateOrganizationRequest(id, data);
    return response.data!;
  }
);

export const adminRemoveOrganization = createAsyncThunk(
  'organizations/adminRemove',
  async (id: string) => {
    await adminDeleteOrganizationRequest(id);
    return id;
  }
);

export const adminSetVerified = createAsyncThunk(
  'organizations/adminSetVerified',
  async ({ id, verified }: { id: string; verified: boolean }) => {
    const response = await adminSetVerifiedRequest(id, verified);
    return response.data!;
  }
);

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    invalidateCache(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch organizations';
      })
      .addCase(addOrganization.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.lastFetched = null;
      })
      .addCase(editOrganization.fulfilled, (state, action) => {
        const index = state.items.findIndex(o => o._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(toggleFollowOrg.fulfilled, (state, action) => {
        const index = state.items.findIndex(o => o._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(toggleFavoriteOrg.fulfilled, (state, action) => {
        const index = state.items.findIndex(o => o._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(removeOrganization.fulfilled, (state, action) => {
        state.items = state.items.filter(o => o._id !== action.payload);
        state.lastFetched = null;
      })
      .addCase(adminAddOrganization.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.lastFetched = null;
      })
      .addCase(adminEditOrganization.fulfilled, (state, action) => {
        const index = state.items.findIndex(o => o._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(adminRemoveOrganization.fulfilled, (state, action) => {
        state.items = state.items.filter(o => o._id !== action.payload);
        state.lastFetched = null;
      })
      .addCase(adminSetVerified.fulfilled, (state, action) => {
        const index = state.items.findIndex(o => o._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      });
  },
});

export const { invalidateCache: invalidateOrganizationsCache } = organizationsSlice.actions;
export default organizationsSlice.reducer;
