/**
 * Dashboard Service
 * Provides dashboard statistics, system health, and overview data
 */

import { apiClient, type ApiResponse } from '../lib/apiClient';
import type { DashboardStats } from '../types/api';

export class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<ApiResponse<{
    status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    components: {
      api: { status: string; responseTime: number; lastCheck: string };
      database: { status: string; connectionCount: number; lastCheck: string };
      whoApi: { status: string; lastSync: string; quota: number };
      cache: { status: string; hitRate: number; size: number };
    };
    uptime: number;
    version: string;
    environment: string;
  }>> {
    return apiClient.get<{
      status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
      components: {
        api: { status: string; responseTime: number; lastCheck: string };
        database: { status: string; connectionCount: number; lastCheck: string };
        whoApi: { status: string; lastSync: string; quota: number };
        cache: { status: string; hitRate: number; size: number };
      };
      uptime: number;
      version: string;
      environment: string;
    }>('/dashboard/health');
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(limit: number = 10): Promise<ApiResponse<{
    activities: Array<{
      id: string;
      type: 'MAPPING_CREATED' | 'DATA_IMPORTED' | 'SYNC_COMPLETED' | 'USER_LOGIN' | 'EXPORT_GENERATED';
      title: string;
      description: string;
      timestamp: string;
      userId?: string;
      userName?: string;
      metadata?: Record<string, any>;
    }>;
    total: number;
  }>> {
    return apiClient.get<{
      activities: Array<{
        id: string;
        type: 'MAPPING_CREATED' | 'DATA_IMPORTED' | 'SYNC_COMPLETED' | 'USER_LOGIN' | 'EXPORT_GENERATED';
        title: string;
        description: string;
        timestamp: string;
        userId?: string;
        userName?: string;
        metadata?: Record<string, any>;
      }>;
      total: number;
    }>('/dashboard/activities', { limit });
  }

  /**
   * Get mapping quality metrics
   */
  static async getMappingQualityMetrics(): Promise<ApiResponse<{
    overall: {
      totalMappings: number;
      averageConfidence: number;
      tier1Percentage: number;
      tier2Percentage: number;
      tier3Percentage: number;
    };
    bySystem: Array<{
      system: string;
      totalCodes: number;
      mappedCodes: number;
      averageConfidence: number;
      coverage: number;
      lastUpdated: string;
    }>;
    qualityTrends: Array<{
      date: string;
      averageConfidence: number;
      mappingCount: number;
      tier1Count: number;
      tier2Count: number;
      tier3Count: number;
    }>;
    topIssues: Array<{
      issue: string;
      count: number;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  }>> {
    return apiClient.get<{
      overall: {
        totalMappings: number;
        averageConfidence: number;
        tier1Percentage: number;
        tier2Percentage: number;
        tier3Percentage: number;
      };
      bySystem: Array<{
        system: string;
        totalCodes: number;
        mappedCodes: number;
        averageConfidence: number;
        coverage: number;
        lastUpdated: string;
      }>;
      qualityTrends: Array<{
        date: string;
        averageConfidence: number;
        mappingCount: number;
        tier1Count: number;
        tier2Count: number;
        tier3Count: number;
      }>;
      topIssues: Array<{
        issue: string;
        count: number;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
      }>;
    }>('/dashboard/mapping-quality');
  }

  /**
   * Get data processing metrics
   */
  static async getDataProcessingMetrics(): Promise<ApiResponse<{
    uploads: {
      total: number;
      successful: number;
      failed: number;
      pending: number;
      averageProcessingTime: number;
    };
    exports: {
      total: number;
      successful: number;
      failed: number;
      totalSize: number;
      averageSize: number;
    };
    recentUploads: Array<{
      filename: string;
      system: string;
      status: string;
      timestamp: string;
      recordCount: number;
    }>;
    systemUsage: Array<{
      system: string;
      uploadCount: number;
      recordCount: number;
      lastActivity: string;
    }>;
  }>> {
    return apiClient.get<{
      uploads: {
        total: number;
        successful: number;
        failed: number;
        pending: number;
        averageProcessingTime: number;
      };
      exports: {
        total: number;
        successful: number;
        failed: number;
        totalSize: number;
        averageSize: number;
      };
      recentUploads: Array<{
        filename: string;
        system: string;
        status: string;
        timestamp: string;
        recordCount: number;
      }>;
      systemUsage: Array<{
        system: string;
        uploadCount: number;
        recordCount: number;
        lastActivity: string;
      }>;
    }>('/dashboard/data-processing');
  }

  /**
   * Get WHO integration metrics
   */
  static async getWHOIntegrationMetrics(): Promise<ApiResponse<{
    status: {
      tm2Status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
      biomedicineStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
      lastSyncTM2: string;
      lastSyncBiomedicine: string;
    };
    usage: {
      monthlyRequests: number;
      quotaLimit: number;
      quotaRemaining: number;
      averageResponseTime: number;
      successRate: number;
    };
    syncHistory: Array<{
      system: 'TM2' | 'BIOMEDICINE';
      date: string;
      status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
      recordsProcessed: number;
      duration: number;
    }>;
    entityCounts: {
      tm2Entities: number;
      biomedicineEntities: number;
      lastUpdated: string;
    };
  }>> {
    return apiClient.get<{
      status: {
        tm2Status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
        biomedicineStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
        lastSyncTM2: string;
        lastSyncBiomedicine: string;
      };
      usage: {
        monthlyRequests: number;
        quotaLimit: number;
        quotaRemaining: number;
        averageResponseTime: number;
        successRate: number;
      };
      syncHistory: Array<{
        system: 'TM2' | 'BIOMEDICINE';
        date: string;
        status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
        recordsProcessed: number;
        duration: number;
      }>;
      entityCounts: {
        tm2Entities: number;
        biomedicineEntities: number;
        lastUpdated: string;
      };
    }>('/dashboard/who-integration');
  }

  /**
   * Get user analytics
   */
  static async getUserAnalytics(): Promise<ApiResponse<{
    activeUsers: {
      total: number;
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    userActivity: Array<{
      date: string;
      logins: number;
      uniqueUsers: number;
      apiCalls: number;
    }>;
    topActions: Array<{
      action: string;
      count: number;
      percentage: number;
    }>;
    sessionStats: {
      averageSessionDuration: number;
      totalSessions: number;
      bounceRate: number;
    };
  }>> {
    return apiClient.get<{
      activeUsers: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
      };
      userActivity: Array<{
        date: string;
        logins: number;
        uniqueUsers: number;
        apiCalls: number;
      }>;
      topActions: Array<{
        action: string;
        count: number;
        percentage: number;
      }>;
      sessionStats: {
        averageSessionDuration: number;
        totalSessions: number;
        bounceRate: number;
      };
    }>('/dashboard/user-analytics');
  }

  /**
   * Get alert notifications
   */
  static async getAlertNotifications(): Promise<ApiResponse<{
    alerts: Array<{
      id: string;
      type: 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';
      title: string;
      message: string;
      timestamp: string;
      isRead: boolean;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      source: string;
      actionRequired: boolean;
      metadata?: Record<string, any>;
    }>;
    unreadCount: number;
    criticalCount: number;
  }>> {
    return apiClient.get<{
      alerts: Array<{
        id: string;
        type: 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';
        title: string;
        message: string;
        timestamp: string;
        isRead: boolean;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        source: string;
        actionRequired: boolean;
        metadata?: Record<string, any>;
      }>;
      unreadCount: number;
      criticalCount: number;
    }>('/dashboard/alerts');
  }

  /**
   * Mark alert as read
   */
  static async markAlertAsRead(alertId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/dashboard/alerts/${alertId}/read`);
  }

  /**
   * Mark all alerts as read
   */
  static async markAllAlertsAsRead(): Promise<ApiResponse<{ success: boolean; markedCount: number }>> {
    return apiClient.post<{ success: boolean; markedCount: number }>('/dashboard/alerts/mark-all-read');
  }

  /**
   * Dismiss alert
   */
  static async dismissAlert(alertId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/dashboard/alerts/${alertId}`);
  }
}

export default DashboardService;