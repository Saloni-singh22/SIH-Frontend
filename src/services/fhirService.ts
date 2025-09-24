/**
 * FHIR Services
 * Comprehensive services for CodeSystem, ConceptMap, ValueSet, and Bundle operations
 */

import { apiClient, type ApiResponse } from '../lib/apiClient';
import type { 
  CodeSystem, 
  ConceptMap, 
  ValueSet, 
  Bundle, 
  PaginationParams,
  SearchParams,
  NAMASTECode,
  ICD11Code
} from '../types/api';

// ================== CODE SYSTEM SERVICE ==================

export class CodeSystemService {
  /**
   * Search CodeSystems with pagination and filtering
   */
  static async search(
    params?: SearchParams & PaginationParams & {
      url?: string;
      name?: string;
      status?: string;
      system?: string;
    }
  ): Promise<ApiResponse<Bundle>> {
    return apiClient.get<Bundle>('/CodeSystem', params);
  }

  /**
   * Get CodeSystem by ID
   */
  static async getById(id: string): Promise<ApiResponse<CodeSystem>> {
    return apiClient.get<CodeSystem>(`/CodeSystem/${id}`);
  }

  /**
   * Create new CodeSystem
   */
  static async create(codeSystem: Omit<CodeSystem, 'id' | 'meta'>): Promise<ApiResponse<CodeSystem>> {
    return apiClient.post<CodeSystem>('/CodeSystem', codeSystem);
  }

  /**
   * Update existing CodeSystem
   */
  static async update(id: string, codeSystem: Partial<CodeSystem>): Promise<ApiResponse<CodeSystem>> {
    return apiClient.put<CodeSystem>(`/CodeSystem/${id}`, codeSystem);
  }

  /**
   * Delete CodeSystem
   */
  static async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/CodeSystem/${id}`);
  }

  /**
   * Validate code in CodeSystem
   */
  static async validateCode(
    id: string, 
    params: { code: string; system?: string; display?: string }
  ): Promise<ApiResponse<{ result: boolean; message?: string; display?: string }>> {
    return apiClient.get<{ result: boolean; message?: string; display?: string }>(
      `/CodeSystem/${id}/$validate-code`, 
      params
    );
  }

  /**
   * Lookup concept in CodeSystem
   */
  static async lookupConcept(
    id: string,
    params: { code: string; system?: string; property?: string[] }
  ): Promise<ApiResponse<{ name: string; display: string; designation?: any[]; property?: any[] }>> {
    return apiClient.get<{ name: string; display: string; designation?: any[]; property?: any[] }>(
      `/CodeSystem/${id}/$lookup`,
      params
    );
  }

  /**
   * Search NAMASTE CodeSystems
   */
  static async searchNAMASTECodeSystems(
    params?: SearchParams & PaginationParams & { system?: 'AYURVEDA' | 'SIDDHA' | 'UNANI' }
  ): Promise<ApiResponse<Bundle>> {
    return apiClient.get<Bundle>('/CodeSystem/namaste/search', params);
  }

  /**
   * Search WHO ICD-11 CodeSystems
   */
  static async searchICD11CodeSystems(
    params?: SearchParams & PaginationParams & { system?: 'TM2' | 'BIOMEDICINE' }
  ): Promise<ApiResponse<Bundle>> {
    return apiClient.get<Bundle>('/CodeSystem/icd11/search', params);
  }
}

// ================== CONCEPT MAP SERVICE ==================

export class ConceptMapService {
  /**
   * Search ConceptMaps
   */
  static async search(
    params?: SearchParams & PaginationParams & {
      url?: string;
      name?: string;
      status?: string;
      source?: string;
      target?: string;
    }
  ): Promise<ApiResponse<Bundle>> {
    return apiClient.get<Bundle>('/ConceptMap', params);
  }

  /**
   * Get ConceptMap by ID
   */
  static async getById(id: string): Promise<ApiResponse<ConceptMap>> {
    return apiClient.get<ConceptMap>(`/ConceptMap/${id}`);
  }

  /**
   * Create new ConceptMap
   */
  static async create(conceptMap: Omit<ConceptMap, 'id' | 'meta'>): Promise<ApiResponse<ConceptMap>> {
    return apiClient.post<ConceptMap>('/ConceptMap', conceptMap);
  }

  /**
   * Translate concept using ConceptMap
   */
  static async translate(
    id: string,
    params: { code: string; system: string; target?: string }
  ): Promise<ApiResponse<{ result: boolean; message?: string; match?: any[] }>> {
    return apiClient.get<{ result: boolean; message?: string; match?: any[] }>(
      `/ConceptMap/${id}/$translate`,
      params
    );
  }

  /**
   * Search NAMASTE ConceptMaps
   */
  static async searchNAMASTEConceptMaps(
    params?: SearchParams & PaginationParams & { 
      sourceSystem?: 'AYURVEDA' | 'SIDDHA' | 'UNANI';
      targetSystem?: 'ICD11-TM2' | 'ICD11-BIOMEDICINE';
    }
  ): Promise<ApiResponse<Bundle>> {
    return apiClient.get<Bundle>('/ConceptMap/namaste/search', params);
  }

  /**
   * Get dual-coding mappings
   */
  static async getDualCodingMappings(id: string): Promise<ApiResponse<{
    namasteCode: NAMASTECode;
    icd11TM2: ICD11Code[];
    icd11Biomedicine: ICD11Code[];
    mappingQuality: {
      tier: string;
      confidence: number;
      equivalence: string;
    };
  }>> {
    return apiClient.get<{
      namasteCode: NAMASTECode;
      icd11TM2: ICD11Code[];
      icd11Biomedicine: ICD11Code[];
      mappingQuality: {
        tier: string;
        confidence: number;
        equivalence: string;
      };
    }>(`/ConceptMap/namaste/${id}/dual-coding`);
  }

  /**
   * Validate NAMASTE mapping
   */
  static async validateMapping(params: {
    sourceCode: string;
    sourceSystem: string;
    targetCode: string;
    targetSystem: string;
    equivalence: string;
  }): Promise<ApiResponse<{
    isValid: boolean;
    confidence: number;
    recommendations: string[];
    issues: string[];
  }>> {
    return apiClient.post<{
      isValid: boolean;
      confidence: number;
      recommendations: string[];
      issues: string[];
    }>('/ConceptMap/namaste/validate-mapping', params);
  }
}

// ================== VALUE SET SERVICE ==================

export class ValueSetService {
  /**
   * Search ValueSets
   */
  static async search(
    params?: SearchParams & PaginationParams & {
      url?: string;
      name?: string;
      status?: string;
      identifier?: string;
    }
  ): Promise<ApiResponse<Bundle>> {
    return apiClient.get<Bundle>('/ValueSet', params);
  }

  /**
   * Get ValueSet by ID
   */
  static async getById(id: string): Promise<ApiResponse<ValueSet>> {
    return apiClient.get<ValueSet>(`/ValueSet/${id}`);
  }

  /**
   * Expand ValueSet
   */
  static async expand(
    id: string,
    params?: { filter?: string; count?: number; offset?: number }
  ): Promise<ApiResponse<ValueSet>> {
    return apiClient.get<ValueSet>(`/ValueSet/${id}/$expand`, params);
  }

  /**
   * Validate code in ValueSet
   */
  static async validateCode(
    id: string,
    params: { code: string; system?: string; display?: string }
  ): Promise<ApiResponse<{ result: boolean; message?: string; display?: string }>> {
    return apiClient.get<{ result: boolean; message?: string; display?: string }>(
      `/ValueSet/${id}/$validate-code`,
      params
    );
  }

  /**
   * Search NAMASTE ValueSets
   */
  static async searchNAMASTEValueSets(
    params?: SearchParams & PaginationParams & { 
      system?: 'AYURVEDA' | 'SIDDHA' | 'UNANI';
      category?: string;
    }
  ): Promise<ApiResponse<Bundle>> {
    return apiClient.get<Bundle>('/ValueSet/namaste/search', params);
  }

  /**
   * Create new ValueSet
   */
  static async create(valueSet: Omit<ValueSet, 'id' | 'meta'>): Promise<ApiResponse<ValueSet>> {
    return apiClient.post<ValueSet>('/ValueSet', valueSet);
  }
}

// ================== MAPPING SERVICE ==================

export class MappingService {
  /**
   * Create comprehensive mapping
   */
  static async createComprehensiveMapping(params: {
    namasteSystem: 'AYURVEDA' | 'SIDDHA' | 'UNANI';
    targetSystems: ('ICD11-TM2' | 'ICD11-BIOMEDICINE')[];
    confidenceThreshold?: number;
    enableAIAssistance?: boolean;
  }): Promise<ApiResponse<{
    taskId: string;
    status: string;
    message: string;
    estimatedDuration: number;
  }>> {
    return apiClient.post<{
      taskId: string;
      status: string;
      message: string;
      estimatedDuration: number;
    }>('/mapping/create-comprehensive', params);
  }

  /**
   * Get mapping status
   */
  static async getMappingStatus(taskId: string): Promise<ApiResponse<{
    taskId: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress: number;
    results?: {
      totalProcessed: number;
      successfulMappings: number;
      failedMappings: number;
      confidence: number;
    };
    error?: string;
  }>> {
    return apiClient.get<{
      taskId: string;
      status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
      progress: number;
      results?: {
        totalProcessed: number;
        successfulMappings: number;
        failedMappings: number;
        confidence: number;
      };
      error?: string;
    }>(`/mapping/status`, { taskId });
  }

  /**
   * Translate code between systems
   */
  static async translateCode(params: {
    sourceCode: string;
    sourceSystem: string;
    targetSystem: string;
    includeChildren?: boolean;
  }): Promise<ApiResponse<{
    translations: Array<{
      code: string;
      display: string;
      system: string;
      equivalence: string;
      confidence: number;
    }>;
    sourceInfo: {
      code: string;
      display: string;
      system: string;
    };
  }>> {
    return apiClient.post<{
      translations: Array<{
        code: string;
        display: string;
        system: string;
        equivalence: string;
        confidence: number;
      }>;
      sourceInfo: {
        code: string;
        display: string;
        system: string;
      };
    }>('/mapping/translate', params);
  }

  /**
   * Get concept map data
   */
  static async getConceptMapData(params?: {
    sourceSystem?: string;
    targetSystem?: string;
    status?: string;
    limit?: number;
  }): Promise<ApiResponse<{
    conceptMaps: ConceptMap[];
    statistics: {
      total: number;
      byStatus: Record<string, number>;
      bySystem: Record<string, number>;
    };
  }>> {
    return apiClient.get<{
      conceptMaps: ConceptMap[];
      statistics: {
        total: number;
        byStatus: Record<string, number>;
        bySystem: Record<string, number>;
      };
    }>('/mapping/conceptmap', params);
  }
}

// ================== ENHANCED MAPPING SERVICE ==================

export class EnhancedMappingService {
  /**
   * Create multi-tier mapping
   */
  static async createMultiTierMapping(params: {
    namasteSystem: 'AYURVEDA' | 'SIDDHA' | 'UNANI';
    batchSize?: number;
    confidenceThreshold?: number;
    enableAIAssistance?: boolean;
  }): Promise<ApiResponse<{
    taskId: string;
    status: string;
    message: string;
    estimatedCompletion: string;
  }>> {
    return apiClient.post<{
      taskId: string;
      status: string;
      message: string;
      estimatedCompletion: string;
    }>('/enhanced-mapping/create-multi-tier', params);
  }

  /**
   * Get enhanced mapping status
   */
  static async getStatus(taskId: string): Promise<ApiResponse<{
    taskId: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress: {
      currentStage: string;
      overallProgress: number;
      tier1Progress: number;
      tier2Progress: number;
      tier3Progress: number;
    };
    results?: {
      tier1: { successful: number; failed: number; avgConfidence: number };
      tier2: { successful: number; failed: number; avgConfidence: number };
      tier3: { successful: number; failed: number; avgConfidence: number };
      totalMappings: number;
    };
  }>> {
    return apiClient.get<{
      taskId: string;
      status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
      progress: {
        currentStage: string;
        overallProgress: number;
        tier1Progress: number;
        tier2Progress: number;
        tier3Progress: number;
      };
      results?: {
        tier1: { successful: number; failed: number; avgConfidence: number };
        tier2: { successful: number; failed: number; avgConfidence: number };
        tier3: { successful: number; failed: number; avgConfidence: number };
        totalMappings: number;
      };
    }>(`/enhanced-mapping/status`, { taskId });
  }

  /**
   * Get mapping analytics
   */
  static async getAnalytics(): Promise<ApiResponse<{
    totalMappings: number;
    mappingsByTier: Record<string, number>;
    mappingsByStatus: Record<string, number>;
    mappingsBySystem: Record<string, number>;
    confidenceDistribution: Array<{ range: string; count: number }>;
    qualityMetrics: {
      averageConfidence: number;
      tier1Coverage: number;
      tier2Coverage: number;
      tier3Coverage: number;
    };
  }>> {
    return apiClient.get<{
      totalMappings: number;
      mappingsByTier: Record<string, number>;
      mappingsByStatus: Record<string, number>;
      mappingsBySystem: Record<string, number>;
      confidenceDistribution: Array<{ range: string; count: number }>;
      qualityMetrics: {
        averageConfidence: number;
        tier1Coverage: number;
        tier2Coverage: number;
        tier3Coverage: number;
      };
    }>('/enhanced-mapping/analytics');
  }

  /**
   * Get tier distribution
   */
  static async getTierDistribution(): Promise<ApiResponse<{
    distributions: Array<{
      system: string;
      tier1: number;
      tier2: number;
      tier3: number;
      unmapped: number;
      total: number;
    }>;
    summary: {
      totalCodes: number;
      mappedCodes: number;
      unmappedCodes: number;
      coveragePercentage: number;
    };
  }>> {
    return apiClient.get<{
      distributions: Array<{
        system: string;
        tier1: number;
        tier2: number;
        tier3: number;
        unmapped: number;
        total: number;
      }>;
      summary: {
        totalCodes: number;
        mappedCodes: number;
        unmappedCodes: number;
        coveragePercentage: number;
      };
    }>('/enhanced-mapping/tier-distribution');
  }

  /**
   * Validate mapping
   */
  static async validateMapping(params: {
    sourceCode: string;
    sourceSystem: string;
    targetCode: string;
    targetSystem: string;
    proposedEquivalence: string;
  }): Promise<ApiResponse<{
    isValid: boolean;
    confidence: number;
    suggestedTier: 'TIER1' | 'TIER2' | 'TIER3';
    recommendations: string[];
    warnings: string[];
    alternativeTargets: Array<{
      code: string;
      display: string;
      confidence: number;
      equivalence: string;
    }>;
  }>> {
    return apiClient.post<{
      isValid: boolean;
      confidence: number;
      suggestedTier: 'TIER1' | 'TIER2' | 'TIER3';
      recommendations: string[];
      warnings: string[];
      alternativeTargets: Array<{
        code: string;
        display: string;
        confidence: number;
        equivalence: string;
      }>;
    }>('/enhanced-mapping/validate-mapping', params);
  }

  /**
   * Get search suggestions
   */
  static async getSearchSuggestions(namasteTerm: string): Promise<ApiResponse<{
    suggestions: Array<{
      term: string;
      system: string;
      confidence: number;
      potentialMatches: Array<{
        code: string;
        display: string;
        system: string;
        confidence: number;
      }>;
    }>;
    exactMatches: Array<{
      code: string;
      display: string;
      system: string;
    }>;
  }>> {
    return apiClient.get<{
      suggestions: Array<{
        term: string;
        system: string;
        confidence: number;
        potentialMatches: Array<{
          code: string;
          display: string;
          system: string;
          confidence: number;
        }>;
      }>;
      exactMatches: Array<{
        code: string;
        display: string;
        system: string;
      }>;
    }>(`/enhanced-mapping/search-suggestions/${encodeURIComponent(namasteTerm)}`);
  }
}

export default {
  CodeSystemService,
  ConceptMapService,
  ValueSetService,
  MappingService,
  EnhancedMappingService
};