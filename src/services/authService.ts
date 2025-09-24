/**
 * Authentication Service
 * Handles ABHA authentication flows and token management
 */

import { apiClient, type ApiResponse } from '../lib/apiClient';
import type { 
  ABHAAuthRequest, 
  AuthResponse
} from '../types/api';

export class AuthService {
  /**
   * Initiate ABHA authentication with OTP
   */
  static async loginWithOTP(abhaNumber: string): Promise<ApiResponse<{ sessionId: string; message: string }>> {
    return apiClient.post('auth/abha/otp/generate', {
      abhaNumber,
      authMethod: 'ABHA_OTP'
    });
  }

  /**
   * Verify OTP and complete authentication
   */
  static async verifyOTP(sessionId: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('auth/abha/otp/verify', {
      sessionId,
      otp
    });
    
    // Store tokens in the API client
    apiClient.setAuthTokens(response.data);
    return response;
  }

  /**
   * Login with ABHA PIN
   */
  static async loginWithPIN(request: ABHAAuthRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('auth/abha/pin', request);
    
    // Store tokens in the API client
    apiClient.setAuthTokens(response.data);
    return response;
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('auth/refresh', {
      refreshToken
    });
    
    // Store new tokens
    apiClient.setAuthTokens(response.data);
    return response;
  }

  /**
   * Logout and clear tokens
   */
  static async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post<{ message: string }>('auth/logout');
      return response;
    } finally {
      // Clear tokens regardless of API response
      apiClient.clearAuth();
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<AuthResponse['abhaProfile']>> {
    return apiClient.get('auth/profile');
  }

  /**
   * Validate current session
   */
  static async validateSession(): Promise<ApiResponse<{ valid: boolean; expiresAt: string }>> {
    return apiClient.get('auth/validate');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Get ABHA profile from localStorage
   */
  static getStoredProfile(): AuthResponse['abhaProfile'] | null {
    try {
      const tokens = localStorage.getItem('namaste_auth_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        return parsed.abhaProfile || null;
      }
    } catch (error) {
      console.warn('Failed to get stored profile:', error);
    }
    return null;
  }
}

export default AuthService;