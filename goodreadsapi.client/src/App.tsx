import { AppBootstrapGate } from '@/components/common/AppBootstrapGate';
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary';
import { MonitoringBridge } from '@/components/common/MonitoringBridge';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LibraryProvider } from '@/context/LibraryContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppRouter } from '@/routes/AppRouter';

function App() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          <ThemeProvider>
            <MonitoringBridge />
            <AuthProvider>
              <LibraryProvider>
                <AppBootstrapGate>
                  <AppRouter />
                </AppBootstrapGate>
              </LibraryProvider>
            </AuthProvider>
          </ThemeProvider>
        </ToastProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}

export default App;
