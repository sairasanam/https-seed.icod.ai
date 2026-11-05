import apiClient from './apiClient';
import type { Action, ActivityLog, ApiResponse } from '../types';

export interface GetActionsParams {
  personId?: string;
  status?: 'pending' | 'completed' | 'postponed' | 'dismissed';
  category?: 'call' | 'message' | 'visit' | 'gift' | 'activity' | 'other';
  priority?: 'low' | 'medium' | 'high';
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export async function getActionsRequest(params?: GetActionsParams): Promise<ApiResponse<Action[]>> {
  const response = await apiClient.get('/actions', { params });
  return response.data;
}

export async function createActionRequest(data: Partial<Action>): Promise<ApiResponse<Action>> {
  const response = await apiClient.post('/actions', data);
  return response.data;
}

export async function updateActionRequest(id: string, data: Partial<Action>): Promise<ApiResponse<Action>> {
  const response = await apiClient.put(`/actions/${id}`, data);
  return response.data;
}

export async function completeActionRequest(id: string): Promise<ApiResponse<Action>> {
  const response = await apiClient.patch(`/actions/${id}/complete`);
  return response.data;
}

export async function undoActionRequest(id: string): Promise<ApiResponse<Action>> {
  const response = await apiClient.post(`/actions/${id}/undo`);
  return response.data;
}

export async function postponeActionRequest(id: string, dueDate: string): Promise<ApiResponse<Action>> {
  const response = await apiClient.post(`/actions/${id}/postpone`, { dueDate });
  return response.data;
}

export async function dismissActionRequest(id: string): Promise<ApiResponse<Action>> {
  const response = await apiClient.post(`/actions/${id}/dismiss`);
  return response.data;
}

export async function deleteActionRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/actions/${id}`);
  return response.data;
}

export async function getActivityLogsRequest(params?: {
  actionId?: string;
  personId?: string;
  limit?: number;
}): Promise<ApiResponse<ActivityLog[]>> {
  const response = await apiClient.get('/actions/activity-logs', { params });
  return response.data;
}
