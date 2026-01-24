import { useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { Alert, AlertSeverity, AlertType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Bell,
  AlertTriangle,
  Clock,
  CalendarDays,
  Handshake,
  FolderKanban,
  CheckCircle2,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; className: string; badgeClass: string }> = {
  critical: { 
    icon: AlertCircle, 
    className: 'text-rose-600 bg-rose-50 border-rose-200', 
    badgeClass: 'bg-rose-500 text-white' 
  },
  warning: { 
    icon: AlertTriangle, 
    className: 'text-amber-600 bg-amber-50 border-amber-200', 
    badgeClass: 'bg-amber-500 text-white' 
  },
  info: { 
    icon: Info, 
    className: 'text-blue-600 bg-blue-50 border-blue-200', 
    badgeClass: 'bg-blue-500 text-white' 
  },
};

const typeConfig: Record<AlertType, { icon: typeof Clock; label: string }> = {
  event_reminder: { icon: CalendarDays, label: 'Eventos' },
  task_overdue: { icon: Clock, label: 'Tarefas Atrasadas' },
  task_due_soon: { icon: Clock, label: 'Prazos Próximos' },
  deal_inactive: { icon: Handshake, label: 'Negócios' },
  project_paused: { icon: FolderKanban, label: 'Projectos' },
  budget_warning: { icon: AlertTriangle, label: 'Orçamento' },
};

interface AlertItemProps {
  alert: Alert;
  onDismiss?: (id: string) => void;
}

function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const severityCfg = severityConfig[alert.severity];
  const typeCfg = typeConfig[alert.type];
  const SeverityIcon = severityCfg.icon;
  const TypeIcon = typeCfg.icon;

  return (
    <div className={cn(
      'p-3 rounded-lg border transition-all duration-200 hover:shadow-md animate-fade-in',
      severityCfg.className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <SeverityIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{alert.title}</span>
            <Badge variant="outline" className="text-xs gap-1">
              <TypeIcon className="w-3 h-3" />
              {typeCfg.label}
            </Badge>
          </div>
          <p className="text-sm opacity-80">{alert.description}</p>
          <p className="text-xs opacity-60 mt-1">
            {formatDistanceToNow(alert.createdAt, { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-50 hover:opacity-100"
            onClick={() => onDismiss(alert.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function AlertCenter() {
  const { alerts, alertsByType, totalCount, criticalCount, warningCount } = useAlerts();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.has(a.id));
  const hasUrgentAlerts = criticalCount > 0 || warningCount > 0;

  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  const filterAlertsByType = (type: AlertType) => 
    alertsByType[type].filter(a => !dismissedAlerts.has(a.id));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative',
            hasUrgentAlerts && 'text-amber-600 hover:text-amber-700'
          )}
        >
          <Bell className={cn('w-5 h-5', hasUrgentAlerts && 'animate-pulse')} />
          {totalCount > 0 && (
            <span className={cn(
              'absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-xs font-bold flex items-center justify-center',
              criticalCount > 0 
                ? 'bg-rose-500 text-white' 
                : warningCount > 0 
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-500 text-white'
            )}>
              {totalCount > 99 ? '99+' : totalCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Centro de Alertas
            {totalCount > 0 && (
              <Badge variant="secondary">{totalCount}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {visibleAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-medium text-foreground">Tudo em dia!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Não há alertas pendentes
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all" className="text-xs">
                Todos
                {visibleAlerts.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{visibleAlerts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs">
                Tarefas
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs">
                Eventos
              </TabsTrigger>
              <TabsTrigger value="deals" className="text-xs">
                Negócios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3 pr-4">
                  {visibleAlerts.map(alert => (
                    <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tasks">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3 pr-4">
                  {[...filterAlertsByType('task_overdue'), ...filterAlertsByType('task_due_soon')].map(alert => (
                    <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
                  ))}
                  {filterAlertsByType('task_overdue').length === 0 && filterAlertsByType('task_due_soon').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum alerta de tarefas</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="events">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3 pr-4">
                  {filterAlertsByType('event_reminder').map(alert => (
                    <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
                  ))}
                  {filterAlertsByType('event_reminder').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum alerta de eventos</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="deals">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3 pr-4">
                  {[...filterAlertsByType('deal_inactive'), ...filterAlertsByType('project_paused')].map(alert => (
                    <AlertItem key={alert.id} alert={alert} onDismiss={handleDismiss} />
                  ))}
                  {filterAlertsByType('deal_inactive').length === 0 && filterAlertsByType('project_paused').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum alerta de negócios</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Compact version for inline display
export function AlertBanner() {
  const { alerts, criticalCount, warningCount } = useAlerts();
  
  if (alerts.length === 0) return null;

  const urgentAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').slice(0, 3);
  
  if (urgentAlerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-2 animate-fade-in">
      {urgentAlerts.map(alert => {
        const severityCfg = severityConfig[alert.severity];
        const SeverityIcon = severityCfg.icon;
        
        return (
          <div 
            key={alert.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              severityCfg.className
            )}
          >
            <SeverityIcon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium text-sm">{alert.title}: </span>
              <span className="text-sm">{alert.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}