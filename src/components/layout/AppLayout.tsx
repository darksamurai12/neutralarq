import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-pastel-peach/50 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] rounded-full bg-pastel-mint/50 blur-[110px]" />
        <div className="absolute top-2/3 right-1/4 w-[350px] h-[350px] rounded-full bg-pastel-lavender/60 blur-[100px]" />
        <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full bg-pastel-sky/50 blur-[90px]" />
      </div>
      <AppSidebar />
      {/* Offset for fixed sidebar */}
      <div className="w-[72px] min-w-[72px] md:w-[17.5rem] md:min-w-[17.5rem] transition-all duration-300" />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="container max-w-7xl py-8 px-4 md:px-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
