/**
 * WHO ICD-11 Integration Service
 * Handles WHO ICD-11 TM2 and Biomedicine API integration
 */

import { apiClient, type ApiResponse } from '../lib/apiClient';
import type { 
  WHOSearchRequest,
  WHOSearchResponse,
  WHOEntity,
  WHOSyncRequest,
  WHOSyncResponse,
  PaginationParams
} from '../types/api';

export class WHOService {
  /**
   * Check WHO API health
   */
  static async checkHealth(): Promise<ApiResponse<{
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    message: string;
    lastSync: string;
    apiVersion: string;
    endpoints: {
      search: boolean;
      entity: boolean;
      sync: boolean;
    };
  }>> {
    return apiClient.get<{
      status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
      message: string;
      lastSync: string;
      apiVersion: string;
      endpoints: {
        search: boolean;
        entity: boolean;
        sync: boolean;
      };
    }>('/health');
  }

  /**
   * Search WHO ICD-11 entities
   */
  static async searchEntities(searchRequest: WHOSearchRequest): Promise<ApiResponse<WHOSearchResponse>> {
    return apiClient.post<WHOSearchResponse>('/search', searchRequest);
  }

  /**
   * Get WHO entity by ID
   */
  static async getEntity(entityId: string, params?: {
    include?: string[];
    language?: string;
  }): Promise<ApiResponse<WHOEntity & {
    parent?: WHOEntity[];
    children?: WHOEntity[];
    inclusions?: string[];
    exclusions?: string[];
    foundationReference?: string;
  }>> {
    return apiClient.get<WHOEntity & {
      parent?: WHOEntity[];
      children?: WHOEntity[];
      inclusions?: string[];
      exclusions?: string[];
      foundationReference?: string;
    }>(`/entity/${entityId}`, params);
  }

  /**
   * Sync TM2 data from WHO
   */
  static async syncTM2Data(syncRequest: WHOSyncRequest): Promise<ApiResponse<WHOSyncResponse>> {
    return apiClient.post<WHOSyncResponse>('/sync/tm2', syncRequest);
  }

  /**
   * Search by keywords
   */
  static async searchByKeywords(params: {
    keywords: string[];
    system?: 'TM2' | 'BIOMEDICINE';
    useFlexisearch?: boolean;
    limit?: number;
  }): Promise<ApiResponse<{
    results: Array<{
      entity: WHOEntity;
      matchScore: number;
      matchedKeywords: string[];
      snippet: string;
    }>;
    totalResults: number;
    searchTime: number;
    suggestions: string[];
  }>> {
    return apiClient.get<{
      results: Array<{
        entity: WHOEntity;
        matchScore: number;
        matchedKeywords: string[];
        snippet: string;
      }>;
      totalResults: number;
      searchTime: number;
      suggestions: string[];
    }>('/search/keywords', params);
  }

  /**
   * Get available code systems
   */
  static async getCodeSystems(): Promise<ApiResponse<{
    systems: Array<{
      id: string;
      name: string;
      description: string;
      version: string;
      lastUpdated: string;
      entityCount: number;
      status: 'ACTIVE' | 'INACTIVE';
    }>;
    statistics: {
      totalSystems: number;
      totalEntities: number;
      lastSyncDate: string;
    };
  }>> {
    return apiClient.get<{
      systems: Array<{
        id: string;
        name: string;
        description: string;
        version: string;
        lastUpdated: string;
        entityCount: number;
        status: 'ACTIVE' | 'INACTIVE';
      }>;
      statistics: {
        totalSystems: number;
        totalEntities: number;
        lastSyncDate: string;
      };
    }>('/codesystems');
  }

  /**
   * Get sync history
   */
  static async getSyncHistory(params?: PaginationParams): Promise<ApiResponse<{
    history: Array<{
      id: string;
      system: 'TM2' | 'BIOMEDICINE';
      startTime: string;
      endTime?: string;
      status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
      processed: number;
      total: number;
      errors: string[];
      duration?: number;
    }>;
    total: number;
    statistics: {
      totalSyncs: number;
      successfulSyncs: number;
      failedSyncs: number;
      averageDuration: number;
    };
  }>> {
    return apiClient.get<{
      history: Array<{
        id: string;
        system: 'TM2' | 'BIOMEDICINE';
        startTime: string;
        endTime?: string;
        status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
        processed: number;
        total: number;
        errors: string[];
        duration?: number;
      }>;
      total: number;
      statistics: {
        totalSyncs: number;
        successfulSyncs: number;
        failedSyncs: number;
        averageDuration: number;
      };
    }>('/sync/history', params);
  }

  /**
   * Cancel ongoing sync
   */
  static async cancelSync(jobId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    jobStatus: string;
  }>> {
    return apiClient.post<{
      success: boolean;
      message: string;
      jobStatus: string;
    }>(`/sync/cancel`, { jobId });
  }

  /**
   * Get WHO API usage statistics
   */
  static async getUsageStats(): Promise<ApiResponse<{
    currentMonth: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      averageResponseTime: number;
    };
    lastMonth: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      averageResponseTime: number;
    };
    quotaLimits: {
      monthlyLimit: number;
      dailyLimit: number;
      currentUsage: number;
      resetDate: string;
    };
    topEndpoints: Array<{
      endpoint: string;
      requests: number;
      averageResponseTime: number;
    }>;
  }>> {
    return apiClient.get<{
      currentMonth: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
      };
      lastMonth: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
      };
      quotaLimits: {
        monthlyLimit: number;
        dailyLimit: number;
        currentUsage: number;
        resetDate: string;
      };
      topEndpoints: Array<{
        endpoint: string;
        requests: number;
        averageResponseTime: number;
      }>;
    }>('/usage/stats');
  }
}

export default WHOService;