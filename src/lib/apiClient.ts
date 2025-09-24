/**
 * API Client Configuration and Base Client
 * Centralized HTTP client with authentication, error handling, and type safety
 */

import type { AuthResponse } from '../types/api';

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableAuth: boolean;
  enableLogging: boolean;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  skipAuth?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

class ApiClient {
  private config: ApiClientConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    try {
      const tokens = localStorage.getItem('namaste_auth_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
        this.tokenExpiresAt = parsed.expiresAt;
      }
    } catch (error) {
      console.warn('Failed to load tokens from storage:', error);
      this.clearTokens();
    }
  }

  private saveTokensToStorage(authResponse: AuthResponse): void {
    try {
      const tokens = {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        expiresAt: Date.now() + (authResponse.expiresIn * 1000)
      };
      localStorage.setItem('namaste_auth_tokens', JSON.stringify(tokens));
      this.accessToken = authResponse.accessToken;
      this.refreshToken = authResponse.refreshToken;
      this.tokenExpiresAt = tokens.expiresAt;
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = 0;
    localStorage.removeItem('namaste_auth_tokens');
  }

  private isTokenExpired(): boolean {
    return Date.now() >= this.tokenExpiresAt - (5 * 60 * 1000); // 5 minutes buffer
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Prevent multiple concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await this.makeRequest<AuthResponse>({
        method: 'POST',
        url: '/auth/refresh',
        data: { refreshToken: this.refreshToken },
        skipAuth: true
      });

      this.saveTokensToStorage(response.data);
      return response.data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  private async getValidToken(): Promise<string | null> {
    if (!this.config.enableAuth || !this.accessToken) {
      return null;
    }

    if (this.isTokenExpired()) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }

    return this.accessToken;
  }

  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = new URL(url, this.config.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fullURL.searchParams.append(key, String(value));
        }
      });
    }

    return fullURL.toString();
  }

  private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, url, data, params, headers = {}, timeout, skipAuth = false } = config;

    // Build URL with parameters
    const fullURL = this.buildURL(url, params);

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add authentication if enabled and not skipped
    if (this.config.enableAuth && !skipAuth) {
      const token = await this.getValidToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout || this.config.timeout),
    };

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    // Make the request with retry logic
    let lastError: Error;
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        if (this.config.enableLogging) {
          console.log(`API Request [Attempt ${attempt + 1}]:`, {
            method,
            url: fullURL,
            headers: requestHeaders,
            data
          });
        }

        const response = await fetch(fullURL, requestOptions);
        const responseData = await this.parseResponse<T>(response);

        if (this.config.enableLogging) {
          console.log(`API Response [${response.status}]:`, responseData);
        }

        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: this.parseHeaders(response.headers)
        };

      } catch (error) {
        lastError = error as Error;
        
        if (this.config.enableLogging) {
          console.error(`API Error [Attempt ${attempt + 1}]:`, error);
        }

        // Don't retry on authentication errors or client errors (4xx)
        if (error instanceof APIError && (error.status === 401 || error.status === 403 || (error.status >= 400 && error.status < 500))) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || '';
    
    let responseData: any;
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      throw new APIError({
        status: response.status,
        code: responseData.code || `HTTP_${response.status}`,
        message: responseData.message || response.statusText || 'Request failed',
        details: responseData.details,
        timestamp: new Date().toISOString(),
        path: response.url
      });
    }

    return responseData;
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Public API methods
  public async get<T>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'GET', url, params, headers });
  }

  public async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'POST', url, data, headers });
  }

  public async put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'PUT', url, data, headers });
  }

  public async delete<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'DELETE', url, headers });
  }

  public async patch<T>(url: string, data?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>({ method: 'PATCH', url, data, headers });
  }

  // Authentication methods
  public setAuthTokens(authResponse: AuthResponse): void {
    this.saveTokensToStorage(authResponse);
  }

  public clearAuth(): void {
    this.clearTokens();
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  // Configuration methods
  public updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}

// Custom API Error class
class APIError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly path: string;

  constructor(errorData: {
    status: number;
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
  }) {
    super(errorData.message);
    this.name = 'APIError';
    this.status = errorData.status;
    this.code = errorData.code;
    this.details = errorData.details;
    this.timestamp = errorData.timestamp;
    this.path = errorData.path;
  }
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  enableAuth: true,
  enableLogging: import.meta.env.DEV
};

// Create and export the default API client instance
export const apiClient = new ApiClient(DEFAULT_CONFIG);
export { APIError };
export default ApiClient;