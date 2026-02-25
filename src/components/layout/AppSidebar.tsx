"use client";

import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Wallet, 
  Calculator, 
  CalendarDays, 
  Package,
  StickyNote,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSidebarState } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'CRM', url: '/crm', icon: Users },
  { title: 'Calendário', url: '/calendario', icon: CalendarDays },
  { title: 'Notas', url: '/notas', icon: StickyNote },
];

const managementItems = [
  { title: 'Projetos', url: '/projetos', icon: FolderKanban },
  { title: 'Finanças', url: '/financas', icon: Wallet },
  { title: 'Inventário', url: '/inventario', icon: Package },
  { title: 'Precificação', url: '/precificacao', icon: Calculator },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { collapsed, setCollapsed } = useSidebarState();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    onNavigate?.();
  };

  const renderNavLink = (item: typeof menuItems[0], end = false) => {
    const content = (
      <NavLink
        to={item.url}
        end={end}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 group",
          collapsed && "justify-center px-0"
        )}
        activeClassName="bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm shadow-blue-100/20 dark:shadow-none"
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="truncate">{item.title}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside className={cn(
      "h-full bg-white dark:bg-background lg:bg-transparent flex flex-col border-r lg:border-none border-slate-100 dark:border-slate-800/50 transition-all duration-300",
      collapsed ? "w-20" : "w-full lg:w-64"
    )}>
      {/* Logo Section */}
      <div className={cn(
        "p-6 mb-2 flex items-center transition-all duration-300",
        collapsed ? "justify-center px-2" : "justify-start"
      )}>
        <img 
          src="/logo02.png" 
          alt="Neutral Arq Logo" 
          className={cn(
            "transition-all duration-300 object-contain dark:invert",
            collapsed ? "h-8 w-8" : "h-12 w-auto"
          )}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Main Menu */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
          )}
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.title}>
                {renderNavLink(item, item.url === '/')}
              </li>
            ))}
          </ul>
        </div>

        {/* Management Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Gestão</p>
          )}
          <ul className="space-y-1">
            {managementItems.map((item) => (
              <li key={item.title}>
                {renderNavLink(item)}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800/50 space-y-2">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl hidden lg:flex",
            collapsed && "justify-center px-0"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Recolher Menu</span>}
        </Button>

        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl",
            collapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sair da Conta</span>}
        </Button>
      </div>
    </aside>
  );
}