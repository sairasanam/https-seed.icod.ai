import apiClient from './apiClient';
import type { Person, Action, ApiResponse } from '../types';

export async function getPeopleRequest(): Promise<ApiResponse<Person[]>> {
  const response = await apiClient.get('/people');
  return response.data;
}

export async function getPersonRequest(id: string): Promise<ApiResponse<{ person: Person; actions: Action[] }>> {
  const response = await apiClient.get(`/people/${id}`);
  return response.data;
}

export async function createPersonRequest(data: Partial<Person>): Promise<ApiResponse<Person>> {
  const response = await apiClient.post('/people', data);
  return response.data;
}

export async function updatePersonRequest(id: string, data: Partial<Person>): Promise<ApiResponse<Person>> {
  const response = await apiClient.put(`/people/${id}`, data);
  return response.data;
}

export async function deletePersonRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/people/${id}`);
  return response.data;
}
