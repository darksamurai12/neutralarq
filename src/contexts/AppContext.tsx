"use client";

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { 
  Client, Project, Transaction, Task, ProjectWithDetails, 
  DashboardMetrics, MonthlyFlow, ProjectKPIs, Deal, DealStage, DealStageConfig, 
  CalendarEvent, ClientInteraction, InventoryItem
} from '@/types';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth, differenceInDays, isPast, isFuture, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useTransactions } from '@/hooks/useTransactions';
import { useTasks } from '@/hooks/useTasks';
import { useDeals } from '@/hooks/useDeals';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useInventory } from '@/hooks/useInventory';
import { useInteractions } from '@/hooks/useInteractions';

export const dealStageConfig: DealStageConfig[] = [
  { id: 'lead', label: 'Lead', probability: 10, color: 'from-slate-400 to-slate-500' },
  { id: 'contacted', label: 'Contacto', probability: 25, color: 'from-blue-400 to-blue-500' },
  { id: 'proposal', label: 'Proposta', probability: 50, color: 'from-purple-400 to-purple-500' },
  { id: 'negotiation', label: 'Negociação', probability: 75, color: 'from-amber-400 to-amber-500' },
  { id: 'won', label: 'Ganho', probability: 100, color: 'from-emerald-400 to-emerald-500' },
  { id: 'lost', label: 'Perdido', probability: 0, color: 'from-rose-400 to-rose-500' },
];

interface AppContextType {
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
  tasks: Task[];
  deals: Deal[];
  calendarEvents: CalendarEvent[];
  inventory: InventoryItem[];
  loading: boolean;
  
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Promise<void>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  moveDealToStage: (id: string, stage: DealStage) => Promise<void>;
  
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  
  addInteraction: (clientId: string, interaction: Omit<ClientInteraction, 'id' | 'createdAt' | 'clientId'>) => Promise<void>;
  deleteInteraction: (clientId: string, interactionId: string) => Promise<void>;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated' | 'totalValue'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  adjustStock: (itemId: string, amount: number, type: 'in' | 'out', reason: string) => Promise<void>;

  getClientProjects: (clientId: string) => Project[];
  getClientInteractions: (clientId: string) => ClientInteraction[];
  getProjectWithDetails: (projectId: string) => ProjectWithDetails | null;
  getSubprojects: (projectId: string) => Project[];
  getDashboardMetrics: () => DashboardMetrics;
  getProjectKPIs: (projectId: string) => ProjectKPIs;
  getPipelineMetrics: () => any;
  getEventsForDay: (day: Date) => CalendarEvent[];
  getEventsForWeek: (day: Date) => CalendarEvent[];
  getEventsForMonth: (day: Date) => CalendarEvent[];
  getUpcomingEvents: (limit: number) => CalendarEvent[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  
  const { clients, fetchClients, addClient, updateClient, deleteClient } = useClients(user?.id);
  const { projects, fetchProjects, addProject, updateProject, deleteProject } = useProjects(user?.id);
  const { transactions, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions(user?.id);
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useTasks(user?.id);
  const { deals, fetchDeals, addDeal, updateDeal, deleteDeal } = useDeals(user?.id);
  const { calendarEvents, fetchCalendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useCalendarEvents(user?.id);
  const { inventory, fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useInventory(user?.id);
  const { interactions, addInteraction, deleteInteraction, getClientInteractions } = useInteractions();

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchClients(), fetchProjects(), fetchTransactions(), fetchTasks(),
        fetchDeals(), fetchCalendarEvents(), fetchInventory()
      ]);
    }
  }, [user, fetchClients, fetchProjects, fetchTransactions, fetchTasks, fetchDeals, fetchCalendarEvents, fetchInventory]);

  const getClientProjects = (clientId: string) => projects.filter(p => p.clientId === clientId);
  const getSubprojects = (projectId: string) => projects.filter(p => p.parentProjectId === projectId);

  const getProjectKPIs = (projectId: string): ProjectKPIs => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    const project = projects.find(p => p.id === projectId);

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'done').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalIncome = projectTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = projectTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
    
    const budget = project?.budget || 0;
    const budgetPercentage = budget > 0 ? Math.round((totalExpenses / budget) * 100) : 0;

    return {
      progressPercentage,
      tasksByStatus: {
        todo: projectTasks.filter(t => t.status === 'todo').length,
        doing: projectTasks.filter(t => t.status === 'doing').length,
        review: projectTasks.filter(t => t.status === 'review').length,
        done: completedTasks,
      },
      overdueTasks: projectTasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done').length,
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      budgetUsed: totalExpenses,
      budgetRemaining: budget - totalExpenses,
      budgetPercentage,
      deadlineDeviation: project ? differenceInDays(new Date(), new Date(project.deadline)) : 0,
    };
  };

  const getProjectWithDetails = (projectId: string): ProjectWithDetails | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    return {
      ...project,
      client: clients.find(c => c.id === project.clientId) || null,
      tasks: tasks.filter(t => t.projectId === projectId),
      transactions: transactions.filter(t => t.projectId === projectId),
      history: [],
      kpis: getProjectKPIs(projectId),
    };
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => subMonths(now, i)).reverse();
    
    const monthlyFlow: MonthlyFlow[] = last6Months.map(date => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthTransactions = transactions.filter(t => 
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
      );

      return {
        month: format(date, 'MMM', { locale: ptBR }),
        income: monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0),
        expenses: monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0),
      };
    });

    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);

    return {
      activeClients: clients.filter(c => c.status === 'active').length,
      activeProjects,
      completedProjects,
      currentBalance: totalRevenue - totalExpenses,
      totalRevenue,
      leadsInFunnel: deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length,
      projectsByStatus: {
        planning: projects.filter(p => p.status === 'planning').length,
        in_progress: activeProjects,
        paused: projects.filter(p => p.status === 'paused').length,
        completed: completedProjects,
      },
      monthlyFlow,
      recentProjects: projects.slice(0, 5),
    };
  };

  const getPipelineMetrics = () => {
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const weightedValue = deals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);
    
    const stageValues = dealStageConfig.reduce((acc, stage) => {
      acc[stage.id] = deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + d.value, 0);
      return acc;
    }, {} as Record<string, number>);

    const dealsByStage = dealStageConfig.reduce((acc, stage) => {
      acc[stage.id] = deals.filter(d => d.stage === stage.id).length;
      return acc;
    }, {} as Record<string, number>);

    return { totalValue, weightedValue, stageValues, dealsByStage };
  };

  const getEventsForDay = (day: Date) => calendarEvents.filter(e => isSameDay(new Date(e.startDate), day));
  const getEventsForWeek = (day: Date) => {
    const start = startOfWeek(day, { weekStartsOn: 1 });
    const end = endOfWeek(day, { weekStartsOn: 1 });
    return calendarEvents.filter(e => isWithinInterval(new Date(e.startDate), { start, end }));
  };
  const getEventsForMonth = (day: Date) => {
    const start = startOfMonth(day);
    const end = endOfMonth(day);
    return calendarEvents.filter(e => isWithinInterval(new Date(e.startDate), { start, end }));
  };
  const getUpcomingEvents = (limit: number) => {
    return calendarEvents
      .filter(e => !e.completed && isFuture(new Date(e.startDate)))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, limit);
  };

  const moveDealToStage = async (id: string, stage: DealStage) => {
    const stageConfig = dealStageConfig.find(s => s.id === stage);
    await updateDeal(id, { stage, probability: stageConfig?.probability || 0 });
  };

  const adjustStock = async (itemId: string, amount: number, type: 'in' | 'out', reason: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    const newQuantity = type === 'in' ? item.quantity + amount : item.quantity - amount;
    if (newQuantity < 0) { toast.error('Stock insuficiente'); return; }
    await updateInventoryItem(itemId, { quantity: newQuantity });
    toast.success(`Stock ajustado: ${type === 'in' ? '+' : '-'}${amount} ${item.unit}`);
  };

  const value = useMemo(() => ({
    clients, projects, transactions, tasks, deals, calendarEvents, inventory, loading: authLoading,
    addClient, updateClient, deleteClient,
    addProject, updateProject, deleteProject,
    addTransaction, updateTransaction, deleteTransaction,
    addTask, updateTask, deleteTask,
    addDeal, updateDeal, deleteDeal, moveDealToStage,
    addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
    addInteraction, deleteInteraction,
    addInventoryItem, updateInventoryItem, deleteInventoryItem, adjustStock,
    getClientProjects, getClientInteractions, getProjectWithDetails, getSubprojects,
    getDashboardMetrics, getProjectKPIs, getPipelineMetrics,
    getEventsForDay, getEventsForWeek, getEventsForMonth, getUpcomingEvents
  }), [
    clients, projects, transactions, tasks, deals, calendarEvents, inventory, authLoading,
    addClient, updateClient, deleteClient,
    addProject, updateProject, deleteProject,
    addTransaction, updateTransaction, deleteTransaction,
    addTask, updateTask, deleteTask,
    addDeal, updateDeal, deleteDeal, moveDealToStage,
    addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
    addInteraction, deleteInteraction,
    addInventoryItem, updateInventoryItem, deleteInventoryItem, adjustStock,
    getClientProjects, getClientInteractions, getProjectWithDetails, getSubprojects,
    getDashboardMetrics, getProjectKPIs, getPipelineMetrics,
    getEventsForDay, getEventsForWeek, getEventsForMonth, getUpcomingEvents
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};