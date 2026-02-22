"use client";

import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Wallet, 
  Calculator, 
  CalendarDays, 
  ChevronDown,
  Package,
  LogOut
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'CRM', url: '/crm', icon: Users },
  { title: 'Calendário', url: '/calendario', icon: CalendarDays },
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
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className="w-full h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-bold text-lg">G</span>
        </div>
        <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">GestãoPro</span>
      </div>

      {/* Team/Profile Selector */}
      <div className="px-4 mb-6">
        <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors group">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm">
              <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate w-32">
                {profile?.company_name || 'Minha Empresa'}
              </p>
              <p className="text-[11px] text-slate-400 truncate w-32">
                {user?.email}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
        {/* Main Menu */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === '/'}
                  onClick={onNavigate}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 group"
                  activeClassName="bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Management Section */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Gestão</p>
          <ul className="space-y-1">
            {managementItems.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  onClick={onNavigate}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 group"
                  activeClassName="bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Sair da Conta</span>
        </Button>
      </div>
    </aside>
  );
}