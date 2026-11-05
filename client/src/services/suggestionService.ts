import apiClient from './apiClient';
import type { Suggestion, ApiResponse, SuggestionContent, SuggestionRequest } from '../types';

export async function generateSuggestionsRequest(
  request: SuggestionRequest
): Promise<ApiResponse<{ id: string; suggestions: SuggestionContent[] }>> {
  const response = await apiClient.post('/suggestions/generate', request);
  return response.data;
}

export async function getSavedSuggestionsRequest(): Promise<ApiResponse<Suggestion[]>> {
  const response = await apiClient.get('/suggestions/saved');
  return response.data;
}

export async function saveSuggestionRequest(id: string): Promise<ApiResponse<Suggestion>> {
  const response = await apiClient.patch(`/suggestions/${id}/save`);
  return response.data;
}

export async function markSuggestionCompletedRequest(id: string, index: number): Promise<ApiResponse<Suggestion>> {
  const response = await apiClient.patch(`/suggestions/${id}/complete`, { index });
  return response.data;
}

export async function dismissSuggestionRequest(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`/suggestions/${id}`);
  return response.data;
}
