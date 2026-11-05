import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotesRequest,
  searchNotesRequest,
  createNoteRequest,
  updateNoteRequest,
  deleteNoteRequest,
} from '../../services/noteService';
import type { Note } from '../../types';

interface NotesState {
  items: Note[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchQuery: string;
}

const initialState: NotesState = {
  items: [],
  status: 'idle',
  error: null,
  searchQuery: '',
};

export const fetchNotes = createAsyncThunk(
  'notes/fetchAll',
  async (params?: { entityId?: string; entityType?: string }) => {
    const response = await getNotesRequest(params?.entityId, params?.entityType);
    return response.data || [];
  }
);

export const searchNotes = createAsyncThunk('notes/search', async (query: string) => {
  const response = await searchNotesRequest(query);
  return response.data || [];
});

export const createNote = createAsyncThunk('notes/create', async (data: Partial<Note>) => {
  const response = await createNoteRequest(data);
  return response.data!;
});

export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ id, data }: { id: string; data: Partial<Note> }) => {
    const response = await updateNoteRequest(id, data);
    return response.data!;
  }
);

export const deleteNote = createAsyncThunk('notes/delete', async (id: string) => {
  await deleteNoteRequest(id);
  return id;
});

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch notes';
      })
      .addCase(searchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(searchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to search notes';
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const idx = state.items.findIndex(n => n._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.items = state.items.filter(n => n._id !== action.payload);
      });
  },
});

export const { setSearchQuery } = notesSlice.actions;
export default notesSlice.reducer;
