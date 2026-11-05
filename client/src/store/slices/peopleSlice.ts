import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPeopleRequest, createPersonRequest, updatePersonRequest, deletePersonRequest } from '../../services/personService';
import type { Person } from '../../types';

/** Cache TTL in milliseconds — skip re-fetch if data is fresher than this */
const CACHE_TTL_MS = 60_000;

interface PeopleState {
  items: Person[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: PeopleState = {
  items: [],
  status: 'idle',
  error: null,
  lastFetched: null,
};

export const fetchPeople = createAsyncThunk(
  'people/fetchAll',
  async (_, { getState }) => {
    const state = (getState() as { people: PeopleState }).people;
    // Use cached data if fresh enough and we have items
    if (state.items.length > 0 && state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL_MS) {
      return state.items;
    }
    const response = await getPeopleRequest();
    return response.data || [];
  }
);

export const addPerson = createAsyncThunk(
  'people/add',
  async (person: Partial<Person>) => {
    const response = await createPersonRequest(person);
    return response.data!;
  }
);

export const editPerson = createAsyncThunk(
  'people/edit',
  async ({ id, data }: { id: string; data: Partial<Person> }) => {
    const response = await updatePersonRequest(id, data);
    return response.data!;
  }
);

export const removePerson = createAsyncThunk(
  'people/remove',
  async (id: string) => {
    await deletePersonRequest(id);
    return id;
  }
);

const peopleSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
    invalidateCache(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPeople.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPeople.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchPeople.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch people';
      })
      .addCase(addPerson.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.lastFetched = null; // Invalidate cache on mutation
      })
      .addCase(editPerson.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        state.lastFetched = null;
      })
      .addCase(removePerson.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
        state.lastFetched = null;
      });
  },
});

export const { invalidateCache: invalidatePeopleCache } = peopleSlice.actions;
export default peopleSlice.reducer;
