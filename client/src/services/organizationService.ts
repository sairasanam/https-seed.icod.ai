import apiClient from './apiClient';
import type { Organization, ApiResponse } from '../types';

export async function getOrganizationsRequest(params?: {
  type?: string;
  search?: string;
  favorites?: string;
  sort?: string;
}): Promise<ApiResponse<Organization[]>> {
  const response = await apiClient.get('/organizations', { params });
  return response.data;
}

export async function getOrganizationRequest(id: string): Promise<ApiResponse<Organization>> {
  const response = await apiClient.get(`/organizations/${id}`);
  return response.data;
}

export async function createOrganizationRequest(data: Partial<Organization>): Promise<ApiResponse<Organization>> {
  const response = await apiClient.post('/organizations', data);
  return response.data;
}

export async function updateOrganizationRequest(id: string, data: Partial<Organization>): Promise<ApiResponse<Organization>> {
  const response = await apiClient.put(`/organizations/${id}`, data);
  return response.data;
}

export async function toggleFollowRequest(id: string): Promise<ApiResponse<Organization>> {
  const response = await apiClient.patch(`/organizations/${id}/follow`);
  return response.data;
}

export async function toggleFavoriteRequest(id: string): Promise<ApiResponse<Organization>> {
  const response = await apiClient.patch(`/organizations/${id}/favorite`);
  return response.data;
}

export async function deleteOrganizationRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/organizations/${id}`);
  return response.data;
}

// Admin endpoints
export async function adminCreateOrganizationRequest(data: Partial<Organization> & { userId?: string }): Promise<ApiResponse<Organization>> {
  const response = await apiClient.post('/organizations/admin', data);
  return response.data;
}

export async function adminUpdateOrganizationRequest(id: string, data: Partial<Organization>): Promise<ApiResponse<Organization>> {
  const response = await apiClient.put(`/organizations/admin/${id}`, data);
  return response.data;
}

export async function adminDeleteOrganizationRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/organizations/admin/${id}`);
  return response.data;
}

export async function adminSetVerifiedRequest(id: string, verified: boolean): Promise<ApiResponse<Organization>> {
  const response = await apiClient.patch(`/organizations/admin/${id}/verify`, { verified });
  return response.data;
}
