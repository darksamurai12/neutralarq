import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Alert, AlertType, AlertSeverity } from '@/types';
import { differenceInDays, differenceInMinutes, isPast, isFuture, addHours } from 'date-fns';

export function useAlerts() {
  const { calendarEvents, tasks, deals, projects, clients } = useApp();

  const alerts = useMemo(() => {
    const generatedAlerts: Alert[] = [];
    const now = new Date();

    // 1. Calendar Event Reminders (events starting within the next 2 hours)
    calendarEvents
      .filter(event => !event.completed && event.reminder)
      .forEach(event => {
        const eventStart = new Date(event.startDate);
        const minutesUntil = differenceInMinutes(eventStart, now);
        
        if (minutesUntil > 0 && minutesUntil <= 120) {
          generatedAlerts.push({
            id: `event-reminder-${event.id}`,
            type: 'event_reminder',
            severity: minutesUntil <= 30 ? 'critical' : 'warning',
            title: 'Evento próximo',
            description: `"${event.title}" começa em ${minutesUntil} minutos`,
            entityId: event.id,
            entityType: 'event',
            createdAt: now,
            read: false,
            dismissed: false,
          });
        }
      });

    // 2. Overdue Tasks
    tasks
      .filter(task => task.status !== 'done' && task.deadline)
      .forEach(task => {
        const deadline = new Date(task.deadline!);
        const daysOverdue = differenceInDays(now, deadline);
        
        if (isPast(deadline)) {
          const project = projects.find(p => p.id === task.projectId);
          generatedAlerts.push({
            id: `task-overdue-${task.id}`,
            type: 'task_overdue',
            severity: daysOverdue > 7 ? 'critical' : 'warning',
            title: 'Tarefa atrasada',
            description: `"${task.title}" está atrasada há ${daysOverdue} dia(s)${project ? ` - ${project.name}` : ''}`,
            entityId: task.id,
            entityType: 'task',
            createdAt: now,
            read: false,
            dismissed: false,
          });
        }
      });

    // 3. Tasks Due Soon (within 3 days)
    tasks
      .filter(task => task.status !== 'done' && task.deadline)
      .forEach(task => {
        const deadline = new Date(task.deadline!);
        const daysUntil = differenceInDays(deadline, now);
        
        if (isFuture(deadline) && daysUntil <= 3 && daysUntil >= 0) {
          const project = projects.find(p => p.id === task.projectId);
          generatedAlerts.push({
            id: `task-due-soon-${task.id}`,
            type: 'task_due_soon',
            severity: daysUntil <= 1 ? 'warning' : 'info',
            title: 'Prazo próximo',
            description: `"${task.title}" vence em ${daysUntil === 0 ? 'hoje' : `${daysUntil} dia(s)`}${project ? ` - ${project.name}` : ''}`,
            entityId: task.id,
            entityType: 'task',
            createdAt: now,
            read: false,
            dismissed: false,
          });
        }
      });

    // 4. Inactive Deals (no activity in 7+ days, excluding won/lost)
    deals
      .filter(deal => deal.stage !== 'won' && deal.stage !== 'lost')
      .forEach(deal => {
        const createdAt = new Date(deal.createdAt);
        const daysSinceCreation = differenceInDays(now, createdAt);
        
        if (daysSinceCreation >= 7) {
          const client = clients.find(c => c.id === deal.clientId);
          generatedAlerts.push({
            id: `deal-inactive-${deal.id}`,
            type: 'deal_inactive',
            severity: daysSinceCreation > 14 ? 'warning' : 'info',
            title: 'Negócio sem atividade',
            description: `"${deal.title}" sem atividade há ${daysSinceCreation} dias${client ? ` - ${client.name}` : ''}`,
            entityId: deal.id,
            entityType: 'deal',
            createdAt: now,
            read: false,
            dismissed: false,
          });
        }
      });

    // 5. Paused Projects
    projects
      .filter(project => project.status === 'paused')
      .forEach(project => {
        const client = clients.find(c => c.id === project.clientId);
        generatedAlerts.push({
          id: `project-paused-${project.id}`,
          type: 'project_paused',
          severity: 'warning',
          title: 'Projecto parado',
          description: `"${project.name}" está pausado${client ? ` - ${client.name}` : ''}`,
          entityId: project.id,
          entityType: 'project',
          createdAt: now,
          read: false,
          dismissed: false,
        });
      });

    // Sort by severity (critical first, then warning, then info)
    const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
    generatedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return generatedAlerts;
  }, [calendarEvents, tasks, deals, projects, clients]);

  const alertsByType = useMemo(() => ({
    event_reminder: alerts.filter(a => a.type === 'event_reminder'),
    task_overdue: alerts.filter(a => a.type === 'task_overdue'),
    task_due_soon: alerts.filter(a => a.type === 'task_due_soon'),
    deal_inactive: alerts.filter(a => a.type === 'deal_inactive'),
    project_paused: alerts.filter(a => a.type === 'project_paused'),
    budget_warning: alerts.filter(a => a.type === 'budget_warning'),
  }), [alerts]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

  return {
    alerts,
    alertsByType,
    totalCount: alerts.length,
    criticalCount,
    warningCount,
    infoCount,
  };
}