/**
 * Integration Verification Component
 * Tests the backend-frontend connection with actual API calls
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle, 
  Database, 
  Shield, 
  Activity,
  Globe
} from 'lucide-react';

// Import API hooks
import { 
  useSystemHealth,
  useAuthStatus, 
  useCodeSystems,
  useWHOEntitySearch
} from '../hooks/useApi';

interface ConnectionTest {
  name: string;
  status: 'testing' | 'success' | 'error' | 'idle';
  message: string;
  icon: React.ReactNode;
}

export function IntegrationVerification() {
  const [tests, setTests] = useState<ConnectionTest[]>([
    {
      name: 'Backend API Connection',
      status: 'idle',
      message: 'Not tested',
      icon: <Database className="w-4 h-4" />
    },
    {
      name: 'Authentication Service',
      status: 'idle',
      message: 'Not tested',
      icon: <Shield className="w-4 h-4" />
    },
    {
      name: 'FHIR CodeSystems',
      status: 'idle',
      message: 'Not tested',
      icon: <Activity className="w-4 h-4" />
    },
    {
      name: 'WHO Integration',
      status: 'idle',
      message: 'Not tested',
      icon: <Globe className="w-4 h-4" />
    }
  ]);

  // API hooks
  const { data: systemHealth, isLoading: healthLoading, error: healthError } = useSystemHealth();
  const { data: authStatus, isLoading: authLoading, error: authError } = useAuthStatus();
  const { data: codeSystems, isLoading: codeSystemsLoading, error: codeSystemsError } = useCodeSystems();
  const { data: whoResults, isLoading: whoLoading, error: whoError } = useWHOEntitySearch('fever');

  const runTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'testing', message: 'Testing...' })));
  };

  useEffect(() => {
    // Update Backend API Connection test
    if (healthLoading) {
      updateTest('Backend API Connection', 'testing', 'Testing system health...');
    } else if (healthError) {
      updateTest('Backend API Connection', 'error', `Failed: ${healthError.message}`);
    } else if (systemHealth) {
      updateTest('Backend API Connection', 'success', `Connected - Status: ${systemHealth.data.status}`);
    }
  }, [systemHealth, healthLoading, healthError]);

  useEffect(() => {
    // Update Authentication Service test
    if (authLoading) {
      updateTest('Authentication Service', 'testing', 'Checking authentication...');
    } else if (authError) {
      updateTest('Authentication Service', 'error', `Auth error: ${authError.message}`);
    } else if (authStatus) {
      const isValid = authStatus.data.valid;
      updateTest('Authentication Service', isValid ? 'success' : 'error', 
        isValid ? 'Authentication valid' : 'Not authenticated');
    }
  }, [authStatus, authLoading, authError]);

  useEffect(() => {
    // Update FHIR CodeSystems test
    if (codeSystemsLoading) {
      updateTest('FHIR CodeSystems', 'testing', 'Loading FHIR resources...');
    } else if (codeSystemsError) {
      updateTest('FHIR CodeSystems', 'error', `FHIR error: ${codeSystemsError.message}`);
    } else if (codeSystems) {
      updateTest('FHIR CodeSystems', 'success', 
        `Found ${codeSystems.data.total || 0} CodeSystems`);
    }
  }, [codeSystems, codeSystemsLoading, codeSystemsError]);

  useEffect(() => {
    // Update WHO Integration test
    if (whoLoading) {
      updateTest('WHO Integration', 'testing', 'Testing WHO API...');
    } else if (whoError) {
      updateTest('WHO Integration', 'error', `WHO error: ${whoError.message}`);
    } else if (whoResults) {
      const entityCount = whoResults.data.destinationEntities?.length || 0;
      updateTest('WHO Integration', 'success', 
        `WHO API connected - Found ${entityCount} entities for 'fever'`);
    }
  }, [whoResults, whoLoading, whoError]);

  const updateTest = (name: string, status: ConnectionTest['status'], message: string) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, message } : test
    ));
  };

  const getStatusIcon = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary">Testing</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-600">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const allTestsPassed = tests.every(test => test.status === 'success');
  const anyTestsRunning = tests.some(test => test.status === 'testing');
  const hasErrors = tests.some(test => test.status === 'error');

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backend-Frontend Integration Verification
          </CardTitle>
          <CardDescription>
            Verify that all API endpoints are working correctly and the integration is complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTests} 
            disabled={anyTestsRunning}
            className="mb-4"
          >
            {anyTestsRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Integration Tests'
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {test.icon}
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-muted-foreground">{test.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  {getStatusBadge(test.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Status */}
      {allTestsPassed && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            🎉 All integration tests passed! Your backend-frontend connection is working perfectly.
          </AlertDescription>
        </Alert>
      )}

      {hasErrors && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>
            Some tests failed. This might indicate backend connectivity issues or missing configuration.
          </AlertDescription>
        </Alert>
      )}

      {/* Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API Base URL:</strong>
              <p className="text-muted-foreground">http://localhost:8000/api/v1</p>
            </div>
            <div>
              <strong>State Management:</strong>
              <p className="text-muted-foreground">TanStack React Query</p>
            </div>
            <div>
              <strong>Authentication:</strong>
              <p className="text-muted-foreground">ABHA OAuth 2.0</p>
            </div>
            <div>
              <strong>FHIR Version:</strong>
              <p className="text-muted-foreground">R4 Compliant</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Available API Hooks:</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>• Authentication: useAuthStatus(), useLogin(), useLogout()</p>
              <p>• FHIR Resources: useCodeSystems(), useConceptMaps(), useValueSets()</p>
              <p>• WHO Integration: useWHOEntitySearch(), useSyncWHOData()</p>
              <p>• Monitoring: useSystemHealth(), useActivityFeed(), useMappingQuality()</p>
              <p>• File Operations: useFileUpload(), useValidateFile(), useExportData()</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}