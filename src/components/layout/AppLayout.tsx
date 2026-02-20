"use client";

import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Conforme imagem */}
        <header className="h-20 px-8 flex items-center justify-between bg-transparent">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Pesquisar..." 
              className="pl-11 h-11 bg-white border-none rounded-2xl shadow-sm focus-visible:ring-primary/20 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-white shadow-sm hover:bg-slate-50">
              <Bell className="w-5 h-5 text-slate-500" />
            </Button>
            
            <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme('light')}
                className={cn("h-9 w-9 rounded-xl", theme === 'light' && "bg-primary text-white shadow-md shadow-primary/20")}
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme('dark')}
                className={cn("h-9 w-9 rounded-xl", theme === 'dark' && "bg-primary text-white shadow-md shadow-primary/20")}
              >
                <Moon className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-white shadow-sm hover:bg-slate-50 overflow-hidden border-2 border-white">
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-8 pt-2"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}