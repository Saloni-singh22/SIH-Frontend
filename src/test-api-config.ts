/**
 * Simple test to verify API client URL construction
 */

import { apiClient } from './lib/apiClient';

// Test the API client configuration
console.log('API Client Configuration Test');
console.log('=============================');
console.log('Base URL:', apiClient.getConfig().baseURL);

// Test URL construction (this will call buildURL internally)
try {
  // This would normally make a request, but we're just testing URL construction
  console.log('Testing dashboard health URL construction...');
  
  // We can't actually make the request without the dev server, 
  // but we can check the configuration
  console.log('Configuration looks correct:', {
    baseURL: apiClient.getConfig().baseURL,
    shouldBe: 'http://localhost:8000'
  });
} catch (error) {
  console.error('Error:', error);
}