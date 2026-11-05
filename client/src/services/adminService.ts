import apiClient from './apiClient';
import type { ApiResponse, ContentLibraryItem } from '../types';

export interface AdminContentListParams {
  treeType?: string;
  type?: string;
  category?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface AdminContentListResponse {
  data: ContentLibraryItem[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
  };
}

// Content Library CRUD
export async function getAdminContentRequest(params?: AdminContentListParams): Promise<ApiResponse<AdminContentListResponse>> {
  const response = await apiClient.get('/admin/content', { params });
  return response.data;
}

export async function createAdminContentRequest(data: Partial<ContentLibraryItem>): Promise<ApiResponse<ContentLibraryItem>> {
  const response = await apiClient.post('/admin/content', data);
  return response.data;
}

export async function updateAdminContentRequest(id: string, data: Partial<ContentLibraryItem>): Promise<ApiResponse<ContentLibraryItem>> {
  const response = await apiClient.put(`/admin/content/${id}`, data);
  return response.data;
}

export async function deleteAdminContentRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/admin/content/${id}`);
  return response.data;
}

// Organization admin management (already in organizationService, re-export for convenience)
export { adminCreateOrganizationRequest, adminUpdateOrganizationRequest, adminDeleteOrganizationRequest, adminSetVerifiedRequest } from './organizationService';

// Template management
export async function getTemplatesRequest(): Promise<ApiResponse<any[]>> {
  const response = await apiClient.get('/initiatives/templates');
  return response.data;
}

export async function createTemplateRequest(data: any): Promise<ApiResponse<any>> {
  const response = await apiClient.post('/initiatives', { ...data, template: true });
  return response.data;
}

export async function updateTemplateRequest(id: string, data: any): Promise<ApiResponse<any>> {
  const response = await apiClient.put(`/initiatives/${id}`, data);
  return response.data;
}

export async function deleteTemplateRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/initiatives/${id}`);
  return response.data;
}

// Categories
export async function getCategoriesRequest(): Promise<ApiResponse<string[]>> {
  const response = await apiClient.get('/explore/categories');
  return response.data;
}

// Featured toggles
export async function toggleOrganizationFeaturedRequest(id: string, featured: boolean): Promise<ApiResponse<any>> {
  const response = await apiClient.patch(`/admin/organizations/${id}/featured`, { featured });
  return response.data;
}

export async function toggleInitiativeFeaturedRequest(id: string, featured: boolean): Promise<ApiResponse<any>> {
  const response = await apiClient.patch(`/admin/initiatives/${id}/featured`, { featured });
  return response.data;
}

// Account deletion
export async function deleteAccountRequest(): Promise<ApiResponse<void>> {
  const response = await apiClient.delete('/auth/account');
  return response.data;
}
