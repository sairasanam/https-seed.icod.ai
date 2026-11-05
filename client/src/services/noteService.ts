import apiClient from './apiClient';
import type { Note, ApiResponse } from '../types';

export async function getNotesRequest(entityId?: string, entityType?: string): Promise<ApiResponse<Note[]>> {
  const params: any = {};
  if (entityId) params.entityId = entityId;
  if (entityType) params.entityType = entityType;
  const response = await apiClient.get('/notes', { params });
  return response.data;
}

export async function searchNotesRequest(query: string): Promise<ApiResponse<Note[]>> {
  const response = await apiClient.get('/notes/search', { params: { q: query } });
  return response.data;
}

export async function createNoteRequest(data: Partial<Note>): Promise<ApiResponse<Note>> {
  const response = await apiClient.post('/notes', data);
  return response.data;
}

export async function updateNoteRequest(id: string, data: Partial<Note>): Promise<ApiResponse<Note>> {
  const response = await apiClient.put(`/notes/${id}`, data);
  return response.data;
}

export async function deleteNoteRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/notes/${id}`);
  return response.data;
}
