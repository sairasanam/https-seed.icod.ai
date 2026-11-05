import apiClient from './apiClient';
import type { Reminder, ApiResponse } from '../types';

export async function getRemindersRequest(): Promise<ApiResponse<Reminder[]>> {
  const response = await apiClient.get('/reminders');
  return response.data;
}

export async function getAllRemindersRequest(): Promise<ApiResponse<Reminder[]>> {
  const response = await apiClient.get('/reminders/all');
  return response.data;
}

export async function createReminderRequest(data: {
  entityId: string;
  entityType: 'person' | 'initiative' | 'organization';
  message: string;
  recurrenceRule?: string;
}): Promise<ApiResponse<void>> {
  const response = await apiClient.post('/reminders', data);
  return response.data;
}

export async function updateReminderRequest(
  id: string,
  data: { message?: string; recurrenceRule?: string; nextTriggerAt?: string }
): Promise<ApiResponse<Reminder>> {
  const response = await apiClient.put(`/reminders/${id}`, data);
  return response.data;
}

export async function deleteReminderRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/reminders/${id}`);
  return response.data;
}

export async function snoozeReminderRequest(
  id: string,
  duration: string | number
): Promise<ApiResponse<Reminder>> {
  const response = await apiClient.post(`/reminders/${id}/snooze`, { duration });
  return response.data;
}

export async function rescheduleReminderRequest(
  id: string,
  nextTriggerAt: string
): Promise<ApiResponse<Reminder>> {
  const response = await apiClient.post(`/reminders/${id}/reschedule`, { nextTriggerAt });
  return response.data;
}
