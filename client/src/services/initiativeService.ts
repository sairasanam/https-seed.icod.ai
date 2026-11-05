import apiClient from './apiClient';
import type { Initiative, ApiResponse } from '../types';

export async function getInitiativesRequest(params?: {
  status?: string;
  search?: string;
  sort?: string;
  template?: string;
}): Promise<ApiResponse<Initiative[]>> {
  const response = await apiClient.get('/initiatives', { params });
  return response.data;
}

export async function getInitiativeRequest(id: string): Promise<ApiResponse<Initiative>> {
  const response = await apiClient.get(`/initiatives/${id}`);
  return response.data;
}

export async function createInitiativeRequest(data: Partial<Initiative>): Promise<ApiResponse<Initiative>> {
  const response = await apiClient.post('/initiatives', data);
  return response.data;
}

export async function updateInitiativeRequest(id: string, data: Partial<Initiative>): Promise<ApiResponse<Initiative>> {
  const response = await apiClient.put(`/initiatives/${id}`, data);
  return response.data;
}

export async function deleteInitiativeRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/initiatives/${id}`);
  return response.data;
}

export async function archiveInitiativeRequest(id: string): Promise<ApiResponse<Initiative>> {
  const response = await apiClient.patch(`/initiatives/${id}/archive`);
  return response.data;
}

export async function addTaskRequest(initiativeId: string, title: string): Promise<ApiResponse<Initiative>> {
  const response = await apiClient.post(`/initiatives/${initiativeId}/tasks`, { title });
  return response.data;
}

export async function toggleTaskRequest(initiativeId: string, taskId: string): Promise<ApiResponse<Initiative>> {
  const response = await apiClient.patch(`/initiatives/${initiativeId}/tasks/${taskId}`);
  return response.data;
}

export async function removeTaskRequest(initiativeId: string, taskId: string): Promise<ApiResponse<Initiative>> {
  const response = await apiClient.delete(`/initiatives/${initiativeId}/tasks/${taskId}`);
  return response.data;
}

export async function getTemplatesRequest(): Promise<ApiResponse<Initiative[]>> {
  const response = await apiClient.get('/initiatives/templates');
  return response.data;
}

export async function createFromTemplateRequest(templateId: string): Promise<ApiResponse<Initiative>> {
  const response = await apiClient.post(`/initiatives/from-template/${templateId}`);
  return response.data;
}
