import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';
import { AlertCenter } from '@/components/alerts/AlertCenter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

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
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-background/50 backdrop-blur-xl border-b border-border/30">
          <div className="container max-w-7xl flex items-center justify-end gap-2 h-16 px-4 md:px-8">
            <ThemeToggle />
            <AlertCenter />
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent">
                    <Avatar className="h-10 w-10 ring-2 ring-border">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-400 text-primary-foreground text-sm font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl shadow-lg border-border/50" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        {profile?.full_name || 'Utilizador'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer rounded-lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Terminar Sessão</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
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
