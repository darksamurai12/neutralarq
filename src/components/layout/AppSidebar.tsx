import { LayoutDashboard, Users, FolderKanban, Wallet, Calculator, CalendarDays, ChevronLeft, ChevronRight, LogOut, Menu } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { AlertCenter } from '@/components/alerts/AlertCenter';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebarState } from '@/contexts/SidebarContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'CRM', url: '/crm', icon: Users },
  { title: 'Calendário', url: '/calendario', icon: CalendarDays },
  { title: 'Projetos', url: '/projetos', icon: FolderKanban },
  { title: 'Finanças', url: '/financas', icon: Wallet },
  { title: 'Precificação', url: '/precificacao', icon: Calculator },
];

interface SidebarContentProps {
  collapsed: boolean;
  onCollapse?: (v: boolean) => void;
  onNavClick?: () => void;
  showCollapseButton?: boolean;
}

function SidebarInner({ collapsed, onCollapse, onNavClick, showCollapseButton = true }: SidebarContentProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

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
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-lg flex-shrink-0">
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
              <Tooltip delayDuration={collapsed ? 100 : 1000}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.url}
                    end={item.url === '/'}
                    onClick={onNavClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent',
                      collapsed && 'justify-center px-0'
                    )}
                    activeClassName="bg-gradient-to-r from-primary/20 to-purple-500/10 text-white border border-primary/20"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section: Actions + User */}
      <div className="p-3 border-t border-sidebar-border space-y-3">
        {/* Quick Actions Row */}
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'justify-between')}>
          <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'gap-1')}>
            <ThemeToggle />
            <AlertCenter />
          </div>
          {showCollapseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapse?.(!collapsed)}
              className="text-sidebar-muted hover:text-white hover:bg-sidebar-accent rounded-xl h-8 w-8 p-0"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* User Profile */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-3 w-full rounded-xl p-2 transition-all duration-200',
                  'hover:bg-sidebar-accent cursor-pointer text-left'
                )}
              >
                <Avatar className="h-9 w-9 ring-2 ring-sidebar-border flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-400 text-primary-foreground text-xs font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {profile?.full_name || 'Utilizador'}
                    </p>
                    <p className="text-[11px] text-sidebar-muted truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl shadow-lg border-border/50" align="end" side="right" sideOffset={8}>
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
    </>
  );
}

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { collapsed, setCollapsed } = useSidebarState();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mobile: hamburger + sheet drawer
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-40 h-10 w-10 rounded-xl bg-sidebar text-sidebar-foreground shadow-lg hover:bg-sidebar-accent"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border [&>button]:text-sidebar-foreground">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <div className="flex flex-col h-full text-sidebar-foreground">
              <SidebarInner
                collapsed={false}
                showCollapseButton={false}
                onNavClick={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside
      className={cn(
        'flex flex-col h-screen fixed top-0 left-0 z-30 text-sidebar-foreground transition-all duration-300 rounded-2xl overflow-hidden m-2',
        'bg-sidebar border border-sidebar-border shadow-xl',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
      style={{ height: 'calc(100vh - 1rem)' }}
    >
      <SidebarInner
        collapsed={collapsed}
        onCollapse={setCollapsed}
        showCollapseButton
      />
    </aside>
  );
}
