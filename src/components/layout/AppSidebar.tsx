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
  LogOut
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    onNavigate?.();
  };

  return (
    <aside className="w-full lg:w-64 h-full bg-white dark:bg-slate-900 lg:bg-transparent flex flex-col border-r lg:border-none border-slate-100 dark:border-slate-800">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <img 
          src="/logo02.png" 
          alt="Logo" 
          className="h-10 w-auto dark:invert"
          onError={(e) => {
            // Fallback caso a imagem não carregue
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = "w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20";
              fallback.innerHTML = '<span class="text-white font-bold text-lg">G</span>';
              parent.appendChild(fallback);
              const text = document.createElement('span');
              text.className = "text-xl font-bold text-slate-800 dark:text-white tracking-tight";
              text.innerText = "GestãoPro";
              parent.appendChild(text);
            }
          }}
        />
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                  activeClassName="bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm shadow-blue-100/20 dark:shadow-none"
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                  activeClassName="bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm shadow-blue-100/20 dark:shadow-none"
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