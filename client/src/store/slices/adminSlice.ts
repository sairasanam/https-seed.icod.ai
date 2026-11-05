import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAdminContentRequest,
  createAdminContentRequest,
  updateAdminContentRequest,
  deleteAdminContentRequest,
  getTemplatesRequest,
  createTemplateRequest,
  updateTemplateRequest,
  deleteTemplateRequest,
  getCategoriesRequest,
} from '../../services/adminService';
import type { ContentLibraryItem } from '../../types';
import type { AdminContentListParams } from '../../services/adminService';

interface TemplateItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  template: boolean;
  tasks: Array<{ title: string; completed: boolean }>;
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  content: {
    items: ContentLibraryItem[];
    total: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  templates: {
    items: TemplateItem[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  categories: {
    items: string[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
}

const initialState: AdminState = {
  content: { items: [], total: 0, status: 'idle', error: null },
  templates: { items: [], status: 'idle', error: null },
  categories: { items: [], status: 'idle', error: null },
};

// Content Library thunks
export const fetchAdminContent = createAsyncThunk(
  'admin/fetchContent',
  async (params?: AdminContentListParams) => {
    const response = await getAdminContentRequest(params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch content');
  }
);

export const addAdminContent = createAsyncThunk(
  'admin/addContent',
  async (data: Partial<ContentLibraryItem>) => {
    const response = await createAdminContentRequest(data);
    if (response.success && response.data) return response.data;
    throw new Error(response.error || 'Failed to create content');
  }
);

export const editAdminContent = createAsyncThunk(
  'admin/editContent',
  async ({ id, data }: { id: string; data: Partial<ContentLibraryItem> }) => {
    const response = await updateAdminContentRequest(id, data);
    if (response.success && response.data) return response.data;
    throw new Error(response.error || 'Failed to update content');
  }
);

export const removeAdminContent = createAsyncThunk(
  'admin/removeContent',
  async (id: string) => {
    await deleteAdminContentRequest(id);
    return id;
  }
);

// Template thunks
export const fetchTemplates = createAsyncThunk(
  'admin/fetchTemplates',
  async () => {
    const response = await getTemplatesRequest();
    if (response.success && response.data) return response.data;
    throw new Error(response.error || 'Failed to fetch templates');
  }
);

export const addTemplate = createAsyncThunk(
  'admin/addTemplate',
  async (data: any) => {
    const response = await createTemplateRequest(data);
    if (response.success && response.data) return response.data;
    throw new Error(response.error || 'Failed to create template');
  }
);

export const editTemplate = createAsyncThunk(
  'admin/editTemplate',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await updateTemplateRequest(id, data);
    if (response.success && response.data) return response.data;
    throw new Error(response.error || 'Failed to update template');
  }
);

export const removeTemplate = createAsyncThunk(
  'admin/removeTemplate',
  async (id: string) => {
    await deleteTemplateRequest(id);
    return id;
  }
);

// Categories thunk
export const fetchCategories = createAsyncThunk(
  'admin/fetchCategories',
  async () => {
    const response = await getCategoriesRequest();
    if (response.success && response.data) return response.data;
    throw new Error(response.error || 'Failed to fetch categories');
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Content
      .addCase(fetchAdminContent.pending, (state) => {
        state.content.status = 'loading';
        state.content.error = null;
      })
      .addCase(fetchAdminContent.fulfilled, (state, action) => {
        state.content.status = 'succeeded';
        state.content.items = action.payload.data;
        state.content.total = action.payload.pagination.total;
      })
      .addCase(fetchAdminContent.rejected, (state, action) => {
        state.content.status = 'failed';
        state.content.error = action.error.message || 'Failed to fetch content';
      })
      .addCase(addAdminContent.fulfilled, (state, action) => {
        state.content.items.unshift(action.payload);
        state.content.total += 1;
      })
      .addCase(editAdminContent.fulfilled, (state, action) => {
        const index = state.content.items.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.content.items[index] = action.payload;
      })
      .addCase(removeAdminContent.fulfilled, (state, action) => {
        state.content.items = state.content.items.filter(i => i._id !== action.payload);
        state.content.total -= 1;
      })
      // Templates
      .addCase(fetchTemplates.pending, (state) => {
        state.templates.status = 'loading';
        state.templates.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates.status = 'succeeded';
        state.templates.items = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.templates.status = 'failed';
        state.templates.error = action.error.message || 'Failed to fetch templates';
      })
      .addCase(addTemplate.fulfilled, (state, action) => {
        state.templates.items.unshift(action.payload);
      })
      .addCase(editTemplate.fulfilled, (state, action) => {
        const index = state.templates.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.templates.items[index] = action.payload;
      })
      .addCase(removeTemplate.fulfilled, (state, action) => {
        state.templates.items = state.templates.items.filter(t => t._id !== action.payload);
      })
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categories.status = 'loading';
        state.categories.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.status = 'succeeded';
        state.categories.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories.status = 'failed';
        state.categories.error = action.error.message || 'Failed to fetch categories';
      });
  },
});

export default adminSlice.reducer;
