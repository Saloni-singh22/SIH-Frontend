// Environment configuration for the application
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  
  // WHO Configuration
  WHO_API_BASE_URL: import.meta.env.VITE_WHO_API_BASE_URL || 'https://id.who.int',
  WHO_CLIENT_ID: import.meta.env.VITE_WHO_CLIENT_ID || '',
  WHO_CLIENT_SECRET: import.meta.env.VITE_WHO_CLIENT_SECRET || '',
  
  // Application Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'NAMASTE-WHO Integration Portal',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // ABHA Configuration
  ABHA_BASE_URL: import.meta.env.VITE_ABHA_BASE_URL || 'https://healthidsbx.ndhm.gov.in/api/v1',
  ENABLE_ABHA_AUTH: import.meta.env.VITE_ENABLE_ABHA_AUTH === 'true',
  
  // Features
  ENABLE_WHO_SYNC: import.meta.env.VITE_ENABLE_WHO_SYNC === 'true',
  ENABLE_MULTI_TIER_MAPPING: import.meta.env.VITE_ENABLE_MULTI_TIER_MAPPING === 'true',
  ENABLE_REAL_TIME_UPDATES: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true',
  ENABLE_BULK_OPERATIONS: import.meta.env.VITE_ENABLE_BULK_OPERATIONS === 'true',
  
  // UI Configuration
  ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20'),
  MAX_FILE_SIZE: import.meta.env.VITE_MAX_FILE_SIZE || '50MB',
  
  // Cache Configuration
  CACHE_DURATION: parseInt(import.meta.env.VITE_CACHE_DURATION || '300000'),
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
} as const;

// Type-safe environment validation
export const validateEnvironment = () => {
  const required = [
    'VITE_API_BASE_URL',
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    if (!ENV_CONFIG.DEBUG_MODE) {
      throw new Error('Application configuration is incomplete');
    }
  }
  
  console.log('Environment configuration loaded:', {
    API_BASE_URL: ENV_CONFIG.API_BASE_URL,
    APP_NAME: ENV_CONFIG.APP_NAME,
    DEBUG_MODE: ENV_CONFIG.DEBUG_MODE,
    FEATURES: {
      ABHA_AUTH: ENV_CONFIG.ENABLE_ABHA_AUTH,
      WHO_SYNC: ENV_CONFIG.ENABLE_WHO_SYNC,
      MULTI_TIER_MAPPING: ENV_CONFIG.ENABLE_MULTI_TIER_MAPPING,
      REAL_TIME_UPDATES: ENV_CONFIG.ENABLE_REAL_TIME_UPDATES,
    }
  });
};