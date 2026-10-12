import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProviders } from '@app/components/AppProviders';
import { AppFrame } from '@app/components/layout/AppFrame';
import { AppLayout } from '@app/components/AppLayout';
import { AppRoot } from '@app/components/layout/AppRoot';
import { LoadingFallback } from '@app/components/shared/LoadingFallback';
import { QuickNavHostProvider } from '@app/contexts/QuickNavHostContext';
import { LockScreen } from '@app/workspace/LocalSettings';
import { PreferencesProvider } from '@app/contexts/PreferencesContext';
import { ThemeProvider } from '@app/components/shared/ThemeProvider';
import Onboarding from '@app/components/onboarding/Onboarding';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@app/styles/tailwind.css';
import '@app/styles/index.css';
import '@app/utils/fileIdSafety';

const Workspace = lazy(() => import('@app/workspace/Workspace'));
const MobileScannerPage = lazy(() => import('@app/pages/MobileScannerPage'));
const MobileSignPage = lazy(() => import('@app/pages/MobileSignPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/mobile-scanner" element={<PreferencesProvider><ThemeProvider><MobileScannerPage /><LockScreen /></ThemeProvider></PreferencesProvider>} />
        <Route path="/mobile-sign" element={<PreferencesProvider><ThemeProvider><MobileSignPage /><LockScreen /></ThemeProvider></PreferencesProvider>} />
        <Route path="/local-workspace" element={
          <QuickNavHostProvider><AppProviders><Workspace /></AppProviders></QuickNavHostProvider>
        } />
        <Route element={<AppFrame />}>
          <Route path="*" element={
            <AppProviders>
              <AppLayout><AppRoot /><Onboarding /><LockScreen /></AppLayout>
            </AppProviders>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}
