import { useState } from 'react';
import { useAuthStore } from '@/store';
import { Sidebar } from '@/components/custom/Sidebar';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ATSAnalyzer } from '@/pages/ATSAnalyzer';
import { ApplicationTracker } from '@/pages/ApplicationTracker';
import { ResumeManager } from '@/pages/ResumeManager';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toaster />
      </>
    );
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'analyzer':
        return <ATSAnalyzer />;
      case 'tracker':
        return <ApplicationTracker />;
      case 'resumes':
        return <ResumeManager />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
