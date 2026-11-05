import apiClient from './apiClient';
import type { User, AuthResponse, ApiResponse } from '../types';

export async function loginRequest(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function registerRequest(name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post('/auth/register', { name, email, password });
  return response.data;
}

export async function getProfileRequest(): Promise<ApiResponse<User>> {
  const response = await apiClient.get('/auth/profile');
  return response.data;
}

export async function updateProfileRequest(updates: Partial<Pick<User, 'name' | 'photo' | 'location' | 'bio' | 'phone' | 'preferences'>>): Promise<ApiResponse<User>> {
  const response = await apiClient.put('/auth/profile', updates);
  return response.data;
}

export async function resendVerificationRequest(): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post('/auth/resend-verification');
  return response.data;
}

export async function forgotPasswordRequest(email: string): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPasswordRequest(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post('/auth/reset-password', { token, password });
  return response.data;
}
