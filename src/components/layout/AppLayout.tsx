import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { AlertCenter } from '@/components/alerts/AlertCenter';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        {/* Top Bar with Alert Center */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="container max-w-7xl flex items-center justify-end h-14 px-4 md:px-8">
            <AlertCenter />
          </div>
        </div>
        <div className="container max-w-7xl py-6 px-4 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
