import { LayoutDashboard, Users, FolderKanban, Wallet, Calculator, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'CRM', url: '/crm', icon: Users },
  { title: 'Calendário', url: '/calendario', icon: CalendarDays },
  { title: 'Projetos', url: '/projetos', icon: FolderKanban },
  { title: 'Finanças', url: '/financas', icon: Wallet },
  { title: 'Precificação', url: '/precificacao', icon: Calculator },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 sticky top-0 rounded-2xl overflow-hidden m-2 shadow-xl shadow-black/20',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-lg">
            <span className="text-sm font-bold text-white">G</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white tracking-tight">GestãoPro</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === '/'}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent'
                )}
                activeClassName="bg-gradient-to-r from-primary/20 to-purple-500/10 text-white border border-primary/20"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-muted hover:text-white hover:bg-sidebar-accent rounded-xl"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}
