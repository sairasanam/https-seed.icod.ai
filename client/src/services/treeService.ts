import apiClient from './apiClient';
import type { DashboardMetrics, DashboardSummary, TreeGrowthData, ApiResponse } from '../types';

export async function getDashboardMetricsRequest(): Promise<ApiResponse<DashboardMetrics>> {
  const response = await apiClient.get('/tree/dashboard');
  return response.data;
}

export async function getDashboardSummaryRequest(): Promise<ApiResponse<DashboardSummary>> {
  const response = await apiClient.get('/tree/dashboard/summary');
  return response.data;
}

export async function getInnerCircleGrowthRequest(): Promise<ApiResponse<TreeGrowthData>> {
  const response = await apiClient.get('/tree/inner-circle');
  return response.data;
}

export async function getCommunityGrowthRequest(): Promise<ApiResponse<TreeGrowthData>> {
  const response = await apiClient.get('/tree/community');
  return response.data;
}

export async function getOuterCircleGrowthRequest(): Promise<ApiResponse<TreeGrowthData>> {
  const response = await apiClient.get('/tree/outer-circle');
  return response.data;
}
