/**
 * TypeScript type definitions for NAMASTE-WHO API integration
 * FHIR R4 compliant types with ABHA authentication support
 */

// ================== BASE API TYPES ==================

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchParams {
  q?: string;
  filter?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ================== AUTHENTICATION TYPES ==================

export interface ABHAAuthRequest {
  abhaNumber: string;
  pin?: string;
  otp?: string;
  authMethod: 'ABHA_OTP' | 'ABHA_PIN' | 'BIOMETRIC';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
  abhaProfile: {
    abhaNumber: string;
    name: string;
    gender: string;
    yearOfBirth: number;
    mobile: string;
    email?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ================== FHIR RESOURCE TYPES ==================

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
}

export interface CodeSystem extends FHIRResource {
  resourceType: 'CodeSystem';
  url: string;
  identifier?: Identifier[];
  version?: string;
  name: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  date?: string;
  publisher?: string;
  description?: string;
  caseSensitive?: boolean;
  content: 'not-present' | 'example' | 'fragment' | 'complete' | 'supplement';
  count?: number;
  concept?: CodeSystemConcept[];
}

export interface CodeSystemConcept {
  code: string;
  display?: string;
  definition?: string;
  designation?: Designation[];
  property?: ConceptProperty[];
  concept?: CodeSystemConcept[];
}

export interface ConceptMap extends FHIRResource {
  resourceType: 'ConceptMap';
  url?: string;
  identifier?: Identifier[];
  version?: string;
  name?: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  date?: string;
  publisher?: string;
  description?: string;
  sourceCanonical?: string;
  targetCanonical?: string;
  group?: ConceptMapGroup[];
}

export interface ConceptMapGroup {
  source?: string;
  sourceVersion?: string;
  target?: string;
  targetVersion?: string;
  element: ConceptMapElement[];
}

export interface ConceptMapElement {
  code?: string;
  display?: string;
  target?: ConceptMapTarget[];
}

export interface ConceptMapTarget {
  code?: string;
  display?: string;
  equivalence: 'relatedto' | 'equivalent' | 'equal' | 'wider' | 'subsumes' | 'narrower' | 'specializes' | 'inexact' | 'unmatched' | 'disjoint';
  comment?: string;
}

export interface ValueSet extends FHIRResource {
  resourceType: 'ValueSet';
  url?: string;
  identifier?: Identifier[];
  version?: string;
  name?: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  date?: string;
  publisher?: string;
  description?: string;
  compose?: ValueSetCompose;
  expansion?: ValueSetExpansion;
}

export interface ValueSetCompose {
  include: ValueSetInclude[];
  exclude?: ValueSetInclude[];
}

export interface ValueSetInclude {
  system?: string;
  version?: string;
  concept?: ValueSetConcept[];
  filter?: ValueSetFilter[];
}

export interface ValueSetConcept {
  code: string;
  display?: string;
  designation?: Designation[];
}

export interface ValueSetExpansion {
  identifier?: string;
  timestamp: string;
  total?: number;
  offset?: number;
  parameter?: ValueSetParameter[];
  contains?: ValueSetExpansionContains[];
}

export interface ValueSetExpansionContains {
  system?: string;
  abstract?: boolean;
  inactive?: boolean;
  version?: string;
  code?: string;
  display?: string;
  designation?: Designation[];
  contains?: ValueSetExpansionContains[];
}

export interface Bundle extends FHIRResource {
  resourceType: 'Bundle';
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  timestamp?: string;
  total?: number;
  link?: BundleLink[];
  entry?: BundleEntry[];
}

export interface BundleEntry {
  link?: BundleLink[];
  fullUrl?: string;
  resource?: FHIRResource;
  search?: BundleEntrySearch;
  request?: BundleEntryRequest;
  response?: BundleEntryResponse;
}

// ================== NAMASTE SPECIFIC TYPES ==================

export interface NAMASTECode {
  id: string;
  code: string;
  display: string;
  definition?: string;
  system: 'AYURVEDA' | 'SIDDHA' | 'UNANI';
  category: string;
  subCategory?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RETIRED' | 'DRAFT';
  dateCreated: string;
  dateModified?: string;
  version: string;
  mappings?: CodeMapping[];
}

export interface ICD11Code {
  id: string;
  code: string;
  display: string;
  definition?: string;
  system: 'ICD11-TM2' | 'ICD11-BIOMEDICINE';
  chapter?: string;
  parentCode?: string;
  children?: string[];
  status: 'CURRENT' | 'RETIRED';
  dateCreated: string;
  whoEntityId?: string;
}

export interface CodeMapping {
  id: string;
  sourceCode: string;
  sourceSystem: string;
  sourceDisplay: string;
  targetCode: string;
  targetSystem: string;
  targetDisplay: string;
  equivalence: ConceptMapTarget['equivalence'];
  confidence: number; // 0-100
  tier: 'TIER1' | 'TIER2' | 'TIER3';
  mappingType: 'EXACT' | 'BROADER' | 'NARROWER' | 'RELATED' | 'INEXACT';
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  reviewer?: string;
  reviewDate?: string;
  comments?: string;
  dateCreated: string;
}

// ================== WHO ICD-11 INTEGRATION TYPES ==================

export interface WHOSearchRequest {
  query: string;
  flatResults?: boolean;
  useFlexisearch?: boolean;
  highlightingEnabled?: boolean;
  subtreeFilterUsed?: boolean;
  includeKeywords?: boolean;
  releaseId?: string;
}

export interface WHOSearchResponse {
  destinationEntities: WHOEntity[];
  words: string[];
  guessType: {
    guessTypeError: boolean;
    bestGuessError: boolean;
    bestGuess: string;
  };
  resultChopped: boolean;
  uniqueSearchId: string;
  bestGuesses: any[];
  error: boolean;
  errorMessage?: string;
}

export interface WHOEntity {
  id: string;
  title: string;
  definition?: string;
  stem?: string;
  code?: string;
  codingNote?: string;
  blockId?: string;
  codeRange?: string;
  classKind?: string;
  child?: string[];
  parent?: string[];
  browserUrl?: string;
}

export interface WHOSyncRequest {
  system: 'TM2' | 'BIOMEDICINE';
  forceUpdate?: boolean;
  batchSize?: number;
}

export interface WHOSyncResponse {
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  jobId: string;
  message: string;
  processed: number;
  total: number;
  errors?: string[];
  startTime: string;
  endTime?: string;
}

// ================== DATA PROCESSING TYPES ==================

export interface FileUploadRequest {
  file: File;
  system: 'NAMASTE_AYURVEDA' | 'NAMASTE_SIDDHA' | 'NAMASTE_UNANI' | 'ICD11_TM2';
  format: 'CSV' | 'XLSX' | 'JSON' | 'XML';
  validation?: {
    strictMode: boolean;
    allowDuplicates: boolean;
    autoCorrect: boolean;
  };
}

export interface FileUploadResponse {
  taskId: string;
  filename: string;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  recordsProcessed: number;
  recordsTotal: number;
  validationErrors: ValidationError[];
  processingTime?: number;
}

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

export interface ExportRequest {
  format: 'JSON' | 'XML' | 'CSV' | 'FHIR_BUNDLE';
  systems: string[];
  includeMetadata: boolean;
  includeMappings: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: {
    status?: string[];
    categories?: string[];
    reviewStatus?: string[];
  };
}

export interface ExportResponse {
  downloadId: string;
  filename: string;
  size: number;
  recordCount: number;
  format: string;
  status: 'GENERATING' | 'READY' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

// ================== ENHANCED MAPPING TYPES ==================

export interface MultiTierMappingRequest {
  namasteSystem: 'AYURVEDA' | 'SIDDHA' | 'UNANI';
  batchSize?: number;
  confidenceThreshold?: number;
  enableAIAssistance?: boolean;
}

export interface MappingAnalytics {
  totalMappings: number;
  mappingsByStatus: Record<string, number>;
  mappingsByTier: Record<string, number>;
  mappingsByEquivalence: Record<string, number>;
  confidenceDistribution: {
    range: string;
    count: number;
  }[];
  systemCoverage: {
    system: string;
    totalCodes: number;
    mappedCodes: number;
    coveragePercentage: number;
  }[];
  reviewProgress: {
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
}

// ================== UTILITY TYPES ==================

export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  system?: string;
  value: string;
}

export interface Designation {
  language?: string;
  use?: Coding;
  value: string;
}

export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface ConceptProperty {
  code: string;
  valueCode?: string;
  valueCoding?: Coding;
  valueString?: string;
  valueInteger?: number;
  valueBoolean?: boolean;
  valueDateTime?: string;
}

export interface ValueSetParameter {
  name: string;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueDecimal?: number;
}

export interface ValueSetFilter {
  property: string;
  op: 'exists' | 'is-a' | 'descendent-of' | 'is-not-a' | 'regex' | 'in' | 'not-in' | 'generalizes';
  value: string;
}

export interface BundleLink {
  relation: 'self' | 'first' | 'prev' | 'next' | 'last';
  url: string;
}

export interface BundleEntrySearch {
  mode?: 'match' | 'include' | 'outcome';
  score?: number;
}

export interface BundleEntryRequest {
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  ifNoneMatch?: string;
  ifModifiedSince?: string;
  ifMatch?: string;
  ifNoneExist?: string;
}

export interface BundleEntryResponse {
  status: string;
  location?: string;
  etag?: string;
  lastModified?: string;
  outcome?: FHIRResource;
}

// ================== DASHBOARD STATS TYPES ==================

export interface DashboardStats {
  namasteCodes: {
    total: number;
    bySystem: Record<string, number>;
    recentlyAdded: number;
    status: Record<string, number>;
  };
  icd11Codes: {
    total: number;
    tm2Codes: number;
    biomedicineCodes: number;
    recentlySync: number;
    lastSyncDate: string;
  };
  mappings: {
    total: number;
    byStatus: Record<string, number>;
    byTier: Record<string, number>;
    byEquivalence: Record<string, number>;
    pendingReview: number;
    averageConfidence: number;
  };
  systemHealth: {
    apiStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    whoApiStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
    databaseStatus: 'CONNECTED' | 'DISCONNECTED';
    lastHealthCheck: string;
  };
}

// ================== ERROR TYPES ==================

export interface APIError {
  status: number;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  code?: string;
}