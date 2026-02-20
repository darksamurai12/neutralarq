"use client";

import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface AppLayoutProps { children: ReactNode; }

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <AppSidebar />
      
      {/* Main Content Wrapper - Centering the main "window" */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-4 lg:p-6">
        <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-glass overflow-hidden border border-white/50">
          {/* Top Header */}
          <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm border-b border-slate-50">
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Pesquisar..." 
                className="pl-11 h-11 bg-slate-50/50 border-none rounded-2xl focus-visible:ring-primary/20 text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-slate-50">
                <Bell className="w-5 h-5 text-slate-500" />
              </Button>
              
              <div className="flex items-center bg-slate-50 rounded-2xl p-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme('light')}
                  className={cn("h-9 w-9 rounded-xl", theme === 'light' && "bg-white text-primary shadow-sm")}
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme('dark')}
                  className={cn("h-9 w-9 rounded-xl", theme === 'dark' && "bg-white text-primary shadow-sm")}
                >
                  <Moon className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-slate-50 overflow-hidden border-2 border-white shadow-sm">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              </Button>
            </div>
          </header>

          {/* Content Scroll Area */}
          <main className="flex-1 overflow-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="p-8 max-w-[1600px] mx-auto w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}