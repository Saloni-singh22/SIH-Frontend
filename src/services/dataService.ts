/**
 * Data Processing Service
 * Handles file uploads, validation, exports, and batch processing
 */

import { apiClient, type ApiResponse } from '../lib/apiClient';
import type { 
  FileUploadResponse,
  ValidationError,
  ExportRequest,
  ExportResponse,
  PaginationParams
} from '../types/api';

export class DataService {
  /**
   * Upload file for processing
   */
  static async uploadFile(
    file: File,
    system: 'NAMASTE_AYURVEDA' | 'NAMASTE_SIDDHA' | 'NAMASTE_UNANI' | 'ICD11_TM2',
    options?: {
      format?: 'CSV' | 'XLSX' | 'JSON' | 'XML';
      strictMode?: boolean;
      allowDuplicates?: boolean;
      autoCorrect?: boolean;
    }
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('system', system);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    return apiClient.post<FileUploadResponse>('upload', formData, {
      'Content-Type': 'multipart/form-data'
    });
  }

  /**
   * Validate data file
   */
  static async validateFile(
    file: File,
    system: string,
    options?: {
      strictMode?: boolean;
      checkDuplicates?: boolean;
      validateReferences?: boolean;
    }
  ): Promise<ApiResponse<{
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    statistics: {
      totalRows: number;
      validRows: number;
      invalidRows: number;
      duplicateRows: number;
    };
    preview: Array<Record<string, any>>;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('system', system);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    return apiClient.post<{
      isValid: boolean;
      errors: ValidationError[];
      warnings: ValidationError[];
      statistics: {
        totalRows: number;
        validRows: number;
        invalidRows: number;
        duplicateRows: number;
      };
      preview: Array<Record<string, any>>;
    }>('/validate', formData, {
      'Content-Type': 'multipart/form-data'
    });
  }

  /**
   * Export data
   */
  static async exportData(request: ExportRequest): Promise<ApiResponse<ExportResponse>> {
    return apiClient.post<ExportResponse>('/export', request);
  }

  /**
   * Get export by code system ID
   */
  static async getExport(codeSystemId: string, format: 'JSON' | 'XML' | 'CSV' = 'JSON'): Promise<ApiResponse<Blob>> {
    const response = await fetch(
      `${apiClient.getConfig().baseURL}/export/${codeSystemId}?format=${format}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('namaste_auth_tokens') ? JSON.parse(localStorage.getItem('namaste_auth_tokens')!).accessToken : ''}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    return {
      data: blob,
      status: response.status,
      statusText: response.statusText,
      headers: {}
    };
  }

  /**
   * Get available systems
   */
  static async getSystems(): Promise<ApiResponse<{
    systems: Array<{
      id: string;
      name: string;
      description: string;
      type: 'NAMASTE' | 'ICD11';
      version: string;
      status: 'ACTIVE' | 'INACTIVE';
      recordCount: number;
      lastUpdated: string;
      supportedFormats: string[];
    }>;
    statistics: {
      totalSystems: number;
      totalRecords: number;
      activeSystemsCount: number;
    };
  }>> {
    return apiClient.get<{
      systems: Array<{
        id: string;
        name: string;
        description: string;
        type: 'NAMASTE' | 'ICD11';
        version: string;
        status: 'ACTIVE' | 'INACTIVE';
        recordCount: number;
        lastUpdated: string;
        supportedFormats: string[];
      }>;
      statistics: {
        totalSystems: number;
        totalRecords: number;
        activeSystemsCount: number;
      };
    }>('/systems');
  }

  /**
   * Batch process data
   */
  static async batchProcess(params: {
    operation: 'VALIDATE' | 'IMPORT' | 'EXPORT' | 'TRANSFORM';
    systems: string[];
    options?: {
      batchSize?: number;
      parallel?: boolean;
      skipErrors?: boolean;
      outputFormat?: string;
    };
  }): Promise<ApiResponse<{
    batchId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    message: string;
    estimatedCompletion: string;
    jobs: Array<{
      id: string;
      system: string;
      status: string;
      progress: number;
    }>;
  }>> {
    return apiClient.post<{
      batchId: string;
      status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      message: string;
      estimatedCompletion: string;
      jobs: Array<{
        id: string;
        system: string;
        status: string;
        progress: number;
      }>;
    }>('/batch-process', params);
  }

  /**
   * Get batch process status
   */
  static async getBatchStatus(batchId: string): Promise<ApiResponse<{
    batchId: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    overallProgress: number;
    jobs: Array<{
      id: string;
      system: string;
      status: string;
      progress: number;
      errors?: string[];
      results?: {
        processed: number;
        successful: number;
        failed: number;
      };
    }>;
    startTime: string;
    endTime?: string;
    results?: {
      totalProcessed: number;
      totalSuccessful: number;
      totalFailed: number;
      outputFiles?: Array<{
        filename: string;
        size: number;
        downloadUrl: string;
      }>;
    };
  }>> {
    return apiClient.get<{
      batchId: string;
      status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      overallProgress: number;
      jobs: Array<{
        id: string;
        system: string;
        status: string;
        progress: number;
        errors?: string[];
        results?: {
          processed: number;
          successful: number;
          failed: number;
        };
      }>;
      startTime: string;
      endTime?: string;
      results?: {
        totalProcessed: number;
        totalSuccessful: number;
        totalFailed: number;
        outputFiles?: Array<{
          filename: string;
          size: number;
          downloadUrl: string;
        }>;
      };
    }>(`/batch-process/status/${batchId}`);
  }

  /**
   * Get template for system
   */
  static async getTemplate(system: 'NAMASTE_AYURVEDA' | 'NAMASTE_SIDDHA' | 'NAMASTE_UNANI' | 'ICD11_TM2'): Promise<ApiResponse<{
    template: {
      filename: string;
      format: string;
      headers: string[];
      sampleData: Array<Record<string, any>>;
      validationRules: Array<{
        field: string;
        rules: string[];
        examples: string[];
      }>;
    };
    documentation: {
      description: string;
      requiredFields: string[];
      optionalFields: string[];
      fieldDescriptions: Record<string, string>;
      examples: Array<Record<string, any>>;
    };
  }>> {
    return apiClient.get<{
      template: {
        filename: string;
        format: string;
        headers: string[];
        sampleData: Array<Record<string, any>>;
        validationRules: Array<{
          field: string;
          rules: string[];
          examples: string[];
        }>;
      };
      documentation: {
        description: string;
        requiredFields: string[];
        optionalFields: string[];
        fieldDescriptions: Record<string, string>;
        examples: Array<Record<string, any>>;
      };
    }>(`/template/${system}`);
  }

  /**
   * Download template file
   */
  static async downloadTemplate(
    system: 'NAMASTE_AYURVEDA' | 'NAMASTE_SIDDHA' | 'NAMASTE_UNANI' | 'ICD11_TM2',
    format: 'CSV' | 'XLSX' = 'CSV'
  ): Promise<void> {
    const response = await fetch(
      `${apiClient.getConfig().baseURL}/template/${system}/download?format=${format}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('namaste_auth_tokens') ? JSON.parse(localStorage.getItem('namaste_auth_tokens')!).accessToken : ''}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Template download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${system}_template.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Get processing history
   */
  static async getProcessingHistory(params?: PaginationParams & {
    system?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{
    history: Array<{
      id: string;
      filename: string;
      system: string;
      operation: string;
      status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      startTime: string;
      endTime?: string;
      recordsProcessed: number;
      recordsSuccessful: number;
      recordsFailed: number;
      errors?: ValidationError[];
      downloadUrl?: string;
    }>;
    total: number;
    statistics: {
      totalUploads: number;
      successfulUploads: number;
      failedUploads: number;
      averageProcessingTime: number;
    };
  }>> {
    return apiClient.get<{
      history: Array<{
        id: string;
        filename: string;
        system: string;
        operation: string;
        status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
        startTime: string;
        endTime?: string;
        recordsProcessed: number;
        recordsSuccessful: number;
        recordsFailed: number;
        errors?: ValidationError[];
        downloadUrl?: string;
      }>;
      total: number;
      statistics: {
        totalUploads: number;
        successfulUploads: number;
        failedUploads: number;
        averageProcessingTime: number;
      };
    }>('/processing/history', params);
  }

  /**
   * Cancel processing job
   */
  static async cancelProcessing(jobId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    jobStatus: string;
  }>> {
    return apiClient.post<{
      success: boolean;
      message: string;
      jobStatus: string;
    }>('/processing/cancel', { jobId });
  }
}

export default DataService;