import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CodeSystem, ConceptMap } from '../types/api';
import { AuthService } from '../services/authService';
import { CodeSystemService, ConceptMapService, ValueSetService, MappingService } from '../services/fhirService';
import { WHOService } from '../services/whoService';
import { DashboardService } from '../services/dashboardService';
import { DataService } from '../services/dataService';

// Query Keys
export const QUERY_KEYS = {
  // Auth
  AUTH_STATUS: ['auth', 'status'] as const,
  
  // CodeSystems
  CODE_SYSTEMS: ['codeSystems'] as const,
  CODE_SYSTEM: (id: string) => ['codeSystems', id] as const,
  CODE_SYSTEM_CONCEPTS: (id: string, params?: any) => ['codeSystems', id, 'concepts', params] as const,
  
  // ConceptMaps
  CONCEPT_MAPS: ['conceptMaps'] as const,
  CONCEPT_MAP: (id: string) => ['conceptMaps', id] as const,
  
  // ValueSets
  VALUE_SETS: ['valueSets'] as const,
  VALUE_SET: (id: string) => ['valueSets', id] as const,
  VALUE_SET_EXPANSION: (id: string) => ['valueSets', id, 'expansion'] as const,
  
  // WHO
  WHO_ENTITIES: (query: string, params?: any) => ['who', 'entities', query, params] as const,
  WHO_ENTITY: (id: string) => ['who', 'entity', id] as const,
  
  // Dashboard
  SYSTEM_HEALTH: ['dashboard', 'health'] as const,
  ACTIVITY_FEED: ['dashboard', 'activity'] as const,
  MAPPING_QUALITY: ['dashboard', 'mapping-quality'] as const,
  
  // Mappings
  MAPPING_SUGGESTIONS: (sourceCode: string, system: string) => ['mapping', 'suggestions', sourceCode, system] as const,
} as const;

// Authentication Hooks
export const useAuthStatus = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH_STATUS,
    queryFn: AuthService.validateSession,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ abhaId }: { abhaId: string }) => AuthService.loginWithOTP(abhaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_STATUS });
    },
  });
};

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ txnId, otp }: { txnId: string; otp: string }) => 
      AuthService.verifyOTP(txnId, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_STATUS });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// CodeSystem Hooks
export const useCodeSystems = (params?: any) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CODE_SYSTEMS, params],
    queryFn: () => CodeSystemService.search(params),
  });
};

export const useCodeSystem = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CODE_SYSTEM(id),
    queryFn: () => CodeSystemService.getById(id),
    enabled: !!id,
  });
};

export const useCodeSystemConcepts = (id: string, params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.CODE_SYSTEM_CONCEPTS(id, params),
    queryFn: () => CodeSystemService.lookupConcept(id, params?.code || ''),
    enabled: !!id && !!params?.code,
  });
};

export const useCreateCodeSystem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (codeSystem: Omit<CodeSystem, 'id'>) => 
      CodeSystemService.create(codeSystem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CODE_SYSTEMS });
    },
  });
};

// ConceptMap Hooks
export const useConceptMaps = (params?: any) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CONCEPT_MAPS, params],
    queryFn: () => ConceptMapService.search(params),
  });
};

export const useConceptMap = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CONCEPT_MAP(id),
    queryFn: () => ConceptMapService.getById(id),
    enabled: !!id,
  });
};

export const useCreateConceptMap = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conceptMap: Omit<ConceptMap, 'id'>) => 
      ConceptMapService.create(conceptMap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONCEPT_MAPS });
    },
  });
};

// ValueSet Hooks
export const useValueSets = (params?: any) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.VALUE_SETS, params],
    queryFn: () => ValueSetService.search(params),
  });
};

export const useValueSet = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VALUE_SET(id),
    queryFn: () => ValueSetService.getById(id),
    enabled: !!id,
  });
};

export const useValueSetExpansion = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.VALUE_SET_EXPANSION(id),
    queryFn: () => ValueSetService.expand(id),
    enabled: !!id,
  });
};

// WHO Hooks
export const useWHOEntitySearch = (query: string, params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.WHO_ENTITIES(query, params),
    queryFn: () => WHOService.searchEntities({ query, ...params }),
    enabled: !!query && query.length > 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useWHOEntity = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.WHO_ENTITY(id),
    queryFn: () => WHOService.getEntity(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSyncWHOData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (syncRequest: any) => WHOService.syncTM2Data(syncRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['who'] });
    },
  });
};

// Dashboard Hooks
export const useSystemHealth = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_HEALTH,
    queryFn: () => DashboardService.getSystemHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useActivityFeed = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVITY_FEED,
    queryFn: () => DashboardService.getRecentActivities(),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useMappingQuality = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MAPPING_QUALITY,
    queryFn: () => DashboardService.getMappingQualityMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mapping Hooks
export const useMappingStatus = (taskId: string) => {
  return useQuery({
    queryKey: ['mapping', 'status', taskId],
    queryFn: () => MappingService.getMappingStatus(taskId),
    enabled: !!taskId,
    refetchInterval: 5000, // Poll every 5 seconds for status
  });
};

export const useCreateMapping = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: any) => MappingService.createComprehensiveMapping(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONCEPT_MAPS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAPPING_QUALITY });
    },
  });
};

// File Operations
export const useFileUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, system, options }: { 
      file: File; 
      system: 'NAMASTE_AYURVEDA' | 'NAMASTE_SIDDHA' | 'NAMASTE_UNANI' | 'ICD11_TM2';
      options?: any;
    }) => DataService.uploadFile(file, system, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CODE_SYSTEMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONCEPT_MAPS });
    },
  });
};

export const useValidateFile = () => {
  return useMutation({
    mutationFn: ({ file, system }: { 
      file: File; 
      system: 'NAMASTE_AYURVEDA' | 'NAMASTE_SIDDHA' | 'NAMASTE_UNANI' | 'ICD11_TM2';
    }) => DataService.validateFile(file, system),
  });
};

export const useExportData = () => {
  return useMutation({
    mutationFn: (request: any) => DataService.exportData(request),
  });
};