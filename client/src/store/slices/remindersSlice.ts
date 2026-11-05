import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getRemindersRequest,
  getAllRemindersRequest,
  updateReminderRequest,
  deleteReminderRequest,
  snoozeReminderRequest,
  rescheduleReminderRequest,
} from '../../services/reminderService';
import type { Reminder } from '../../types';

/** Cache TTL in milliseconds — skip re-fetch if data is fresher than this */
const CACHE_TTL_MS = 60_000;

interface RemindersState {
  items: Reminder[];
  allItems: Reminder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastFetched: number | null;
}

const initialState: RemindersState = {
  items: [],
  allItems: [],
  status: 'idle',
  error: null,
  lastFetched: null,
};

export const fetchReminders = createAsyncThunk(
  'reminders/fetchAll',
  async (_, { getState }) => {
    const state = (getState() as { reminders: RemindersState }).reminders;
    // Use cached data if fresh enough and we have items
    if (state.items.length > 0 && state.lastFetched && Date.now() - state.lastFetched < CACHE_TTL_MS) {
      return state.items;
    }
    const response = await getRemindersRequest();
    return response.data || [];
  }
);

export const fetchAllReminders = createAsyncThunk('reminders/fetchAllFull', async () => {
  const response = await getAllRemindersRequest();
  return response.data || [];
});

export const updateReminder = createAsyncThunk(
  'reminders/update',
  async ({ id, data }: { id: string; data: { message?: string; recurrenceRule?: string; nextTriggerAt?: string } }) => {
    const response = await updateReminderRequest(id, data);
    return response.data!;
  }
);

export const deleteReminder = createAsyncThunk('reminders/delete', async (id: string) => {
  await deleteReminderRequest(id);
  return id;
});

export const snoozeReminder = createAsyncThunk(
  'reminders/snooze',
  async ({ id, duration }: { id: string; duration: string | number }) => {
    const response = await snoozeReminderRequest(id, duration);
    return response.data!;
  }
);

export const rescheduleReminder = createAsyncThunk(
  'reminders/reschedule',
  async ({ id, nextTriggerAt }: { id: string; nextTriggerAt: string }) => {
    const response = await rescheduleReminderRequest(id, nextTriggerAt);
    return response.data!;
  }
);

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    invalidateCache(state) {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch reminders';
      })
      .addCase(fetchAllReminders.fulfilled, (state, action) => {
        state.allItems = action.payload;
      })
      .addCase(updateReminder.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.allItems.findIndex(r => r.id === updated.id);
        if (idx !== -1) state.allItems[idx] = updated;
        const idx2 = state.items.findIndex(r => r.id === updated.id);
        if (idx2 !== -1) state.items[idx2] = updated;
        state.lastFetched = null;
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.allItems = state.allItems.filter(r => r.id !== action.payload);
        state.items = state.items.filter(r => r.id !== action.payload);
        state.lastFetched = null;
      })
      .addCase(snoozeReminder.fulfilled, (state, action) => {
        const snoozed = action.payload;
        const idx = state.allItems.findIndex(r => r.id === snoozed.id);
        if (idx !== -1) state.allItems[idx] = snoozed;
        const idx2 = state.items.findIndex(r => r.id === snoozed.id);
        if (idx2 !== -1) state.items[idx2] = snoozed;
        state.lastFetched = null;
      })
      .addCase(rescheduleReminder.fulfilled, (state, action) => {
        const rescheduled = action.payload;
        const idx = state.allItems.findIndex(r => r.id === rescheduled.id);
        if (idx !== -1) state.allItems[idx] = rescheduled;
        const idx2 = state.items.findIndex(r => r.id === rescheduled.id);
        if (idx2 !== -1) state.items[idx2] = rescheduled;
        state.lastFetched = null;
      });
  },
});

export const { invalidateCache: invalidateRemindersCache } = remindersSlice.actions;
export default remindersSlice.reducer;
