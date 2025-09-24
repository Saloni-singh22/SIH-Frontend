/**
 * API Configuration
 * Uses environment variables for configuration
 */

import { ENV_CONFIG } from './env';

export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  TIMEOUT: ENV_CONFIG.API_TIMEOUT,
  ENABLE_LOGGING: ENV_CONFIG.DEBUG_MODE,
  ENABLE_AUTH: ENV_CONFIG.ENABLE_ABHA_AUTH,
} as const;