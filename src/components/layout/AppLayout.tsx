"use client";

import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { Search, Bell, Moon, Sun, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps { children: ReactNode; }

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && <AppSidebar />}
      
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden border-slate-100 dark:border-slate-800 transition-all duration-300",
        !isMobile ? "rounded-tl-[1.5rem] shadow-glass mt-2 border-l border-t" : "mt-0 rounded-none border-none"
      )}>
        {/* Top Header */}
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-50 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Trigger */}
            {isMobile && (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-none">
                  <AppSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            )}

            {/* Search Bar - Hidden on very small screens, or simplified */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Pesquisar..." 
                className="pl-11 h-10 md:h-11 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-2xl focus-visible:ring-primary/20 text-sm"
              />
            </div>
            
            {isMobile && (
              <span className="font-bold text-slate-800 dark:text-white tracking-tight">GestãoPro</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">
              <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </Button>
            
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme('light')}
                className={cn("h-8 w-8 md:h-9 md:w-9 rounded-xl transition-all", theme === 'light' && "bg-white dark:bg-slate-700 text-primary shadow-sm")}
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme('dark')}
                className={cn("h-8 w-8 md:h-9 md:w-9 rounded-xl transition-all", theme === 'dark' && "bg-white dark:bg-slate-700 text-primary shadow-sm")}
              >
                <Moon className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
              <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400 dark:text-slate-500" />
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
              className="p-4 md:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}