import { useState } from 'react';
import { QueryProvider } from './components/QueryProvider';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { NamasteCodes } from './components/pages/NamasteCodes';
import { TM2Codes } from './components/pages/TM2Codes';
import { Mappings } from './components/pages/Mappings';
import { ProfileList } from './components/pages/ProfileList';
import { FHIRDownloads } from './components/pages/FHIRDownloads';
import { AdminPage } from './components/pages/AdminPage';
import { HelpPage } from './components/pages/HelpPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { IntegrationVerification } from './components/IntegrationVerification';
import { validateEnvironment } from './config/env';

// Validate environment configuration on app startup
validateEnvironment();

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'namaste-codes':
        return <NamasteCodes />;
      case 'tm2-codes':
        return <TM2Codes />;
      case 'mappings':
        return <Mappings />;
      case 'profiles':
        return <ProfileList />;
      case 'downloads':
        return <FHIRDownloads />;
      case 'admin':
        return <AdminPage />;
      case 'help':
        return <HelpPage />;
      case 'settings':
        return <SettingsPage />;
      case 'integration-test':
        return <IntegrationVerification />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}