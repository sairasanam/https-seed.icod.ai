import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import peopleReducer from './slices/peopleSlice';
import initiativesReducer from './slices/initiativesSlice';
import organizationsReducer from './slices/organizationsSlice';
import dashboardReducer from './slices/dashboardSlice';
import remindersReducer from './slices/remindersSlice';
import exploreReducer from './slices/exploreSlice';
import actionsReducer from './slices/actionsSlice';
import notesReducer from './slices/notesSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    people: peopleReducer,
    initiatives: initiativesReducer,
    organizations: organizationsReducer,
    dashboard: dashboardReducer,
    reminders: remindersReducer,
    explore: exploreReducer,
    actions: actionsReducer,
    notes: notesReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
