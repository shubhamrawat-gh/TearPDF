import { Suspense } from 'react';
import { AppProviders } from '@app/components/AppProviders';
import { QuickNavHostProvider } from '@app/contexts/QuickNavHostContext';
import Workspace from '@app/workspace/Workspace';
import '@app/styles/tailwind.css';
import '@app/styles/index.css';
export default function App() {return <Suspense fallback={<p>Opening TearPDF…</p>}><QuickNavHostProvider><AppProviders><Workspace/></AppProviders></QuickNavHostProvider></Suspense>;}
