import apiClient from './apiClient';
import type { ContentLibraryItem, ApiResponse } from '../types';

export interface ExploreFilters {
  type?: 'suggestion' | 'initiative';
  treeType?: 'inner' | 'community' | 'outer';
  category?: string;
  search?: string;
}

export async function getExploreItemsRequest(filters?: ExploreFilters): Promise<ApiResponse<ContentLibraryItem[]>> {
  const response = await apiClient.get('/explore', { params: filters });
  return response.data;
}

export async function getCategoriesRequest(): Promise<ApiResponse<string[]>> {
  const response = await apiClient.get('/explore/categories');
  return response.data;
}
