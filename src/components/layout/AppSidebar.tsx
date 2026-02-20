"use client";

import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Wallet, 
  Calculator, 
  CalendarDays, 
  Plus,
  ChevronDown,
  Search,
  Bell,
  Settings,
  Grid,
  FileText
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'CRM', url: '/crm', icon: Users },
  { title: 'Calendário', url: '/calendario', icon: CalendarDays },
];

const managementItems = [
  { title: 'Projetos', url: '/projetos', icon: FolderKanban },
  { title: 'Finanças', url: '/financas', icon: Wallet },
  { title: 'Precificação', url: '/precificacao', icon: Calculator },
];

export function AppSidebar() {
  const { profile, user } = useAuth();

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-bold text-lg">G</span>
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">GestãoPro</span>
      </div>

      {/* Team/Profile Selector */}
      <div className="px-4 mb-6">
        <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-xl border-2 border-white shadow-sm">
              <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-700 truncate w-32">
                {profile?.company_name || 'Minha Empresa'}
              </p>
              <p className="text-[11px] text-slate-400 truncate w-32">
                {user?.email}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
        {/* Main Menu */}
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === '/'}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-primary hover:bg-blue-50/50 transition-all duration-200 group"
                  activeClassName="bg-blue-50 text-primary shadow-sm shadow-blue-100/50"
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-primary hover:bg-blue-50/50 transition-all duration-200 group"
                  activeClassName="bg-blue-50 text-primary shadow-sm shadow-blue-100/50"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Bottom Action Button */}
      <div className="p-4 border-t border-slate-50">
        <Button className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 gap-2">
          <Plus className="w-5 h-5" />
          Novo Projeto
        </Button>
      </div>
    </aside>
  );
}