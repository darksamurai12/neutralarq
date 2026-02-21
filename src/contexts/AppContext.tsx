"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Client, Project, Transaction, Task, ProjectWithDetails, 
  DashboardMetrics, MonthlyFlow, TaskStatus, ProjectStatus, 
  ProjectKPIs, Deal, DealStage, DealStageConfig, 
  CalendarEvent, CalendarEventType, ClientInteraction, InteractionType,
  InventoryItem, StockMovement, InventoryCategory
} from '@/types';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth, differenceInDays, isPast, isFuture, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setClients([]);
      setProjects([]);
      setTransactions([]);
      setTasks([]);
      setDeals([]);
      setCalendarEvents([]);
      setInventory([]);
      setInteractions([]);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [clientsRes, projectsRes, transactionsRes, tasksRes, dealsRes, eventsRes, interactionsRes, inventoryRes] = await Promise.all([
          supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('deals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('calendar_events').select('*').eq('user_id', user.id).order('start_date', { ascending: true }),
          supabase.from('client_interactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('inventory').select('*').eq('user_id', user.id).order('name', { ascending: true }),
        ]);

        setClients((clientsRes.data || []).map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          company: row.company,
          position: row.position,
          address: row.address,
          notes: row.notes,
          status: row.status as any,
          createdAt: new Date(row.created_at)
        })));

        setProjects((projectsRes.data || []).map(row => ({
          id: row.id,
          name: row.name,
          clientId: row.client_id,
          type: row.type as any,
          location: row.location,
          description: row.description,
          startDate: new Date(row.start_date),
          deadline: new Date(row.deadline),
          budget: Number(row.budget),
          status: row.status as any,
          parentProjectId: row.parent_project_id,
          createdAt: new Date(row.created_at)
        })));

        setTransactions((transactionsRes.data || []).map(row => ({
          id: row.id,
          description: row.description,
          value: Number(row.value),
          type: row.type as any,
          destination: row.destination as any,
          category: row.category as any,
          projectId: row.project_id,
          clientId: row.client_id,
          date: new Date(row.date),
          createdAt: new Date(row.created_at)
        })));

        setTasks((tasksRes.data || []).map(row => ({
          id: row.id,
          projectId: row.project_id,
          title: row.title,
          description: row.description,
          responsible: row.responsible,
          deadline: row.deadline ? new Date(row.deadline) : null,
          status: row.status as any,
          priority: row.priority as any,
          phase: row.phase as any,
          completionPercentage: Number(row.completion_percentage),
          subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
          comments: Array.isArray(row.comments) ? row.comments : [],
          createdAt: new Date(row.created_at)
        })));

        setDeals((dealsRes.data || []).map(row => ({
          id: row.id,
          title: row.title,
          clientId: row.client_id,
          value: Number(row.value),
          stage: row.stage as any,
          probability: Number(row.probability),
          expectedCloseDate: row.expected_close_date ? new Date(row.expected_close_date) : null,
          notes: row.notes,
          createdAt: new Date(row.created_at)
        })));

        setCalendarEvents((eventsRes.data || []).map(row => ({
          id: row.id,
          title: row.title,
          description: row.description,
          type: row.type as any,
          startDate: new Date(row.start_date),
          endDate: new Date(row.end_date),
          allDay: row.all_day,
          clientId: row.client_id,
          dealId: row.deal_id,
          reminder: row.reminder,
          completed: row.completed,
          createdAt: new Date(row.created_at)
        })));

        setInteractions((interactionsRes.data || []).map(row => ({
          id: row.id,
          clientId: row.client_id,
          type: row.type as any,
          description: row.description,
          date: new Date(row.date),
          createdAt: new Date(row.created_at)
        })));

        setInventory((inventoryRes.data || []).map(row => ({
          id: row.id,
          name: row.name,
          category: row.category as any,
          quantity: Number(row.quantity),
          unit: row.unit,
          minStock: Number(row.min_stock),
          unitCost: Number(row.unit_cost),
          totalValue: Number(row.quantity) * Number(row.unit_cost),
          location: row.location,
          lastUpdated: new Date(row.updated_at),
          createdAt: new Date(row.created_at)
        })));

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  // Helper functions
  const getClientProjects = useCallback((clientId: string) => projects.filter(p => p.clientId === clientId), [projects]);
  const getClientInteractions = useCallback((clientId: string) => interactions.filter(i => i.clientId === clientId), [interactions]);
  const getSubprojects = useCallback((projectId: string) => projects.filter(p => p.parentProjectId === projectId), [projects]);

  const getProjectKPIs = useCallback((projectId: string): ProjectKPIs => {
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
  }, [tasks, transactions, projects]);

  const getProjectWithDetails = useCallback((projectId: string): ProjectWithDetails | null => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    return {
      ...project,
      client: clients.find(c => c.id === project.clientId) || null,
      tasks: tasks.filter(t => t.projectId === projectId),
      transactions: transactions.filter(t => t.projectId === projectId),
      history: [], // Mock history for now
      kpis: getProjectKPIs(projectId),
    };
  }, [projects, clients, tasks, transactions, getProjectKPIs]);

  const getDashboardMetrics = useCallback((): DashboardMetrics => {
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
  }, [clients, projects, transactions, deals]);

  const getPipelineMetrics = useCallback(() => {
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
  }, [deals]);

  const getEventsForDay = useCallback((day: Date) => calendarEvents.filter(e => isSameDay(new Date(e.startDate), day)), [calendarEvents]);
  const getEventsForWeek = useCallback((day: Date) => {
    const start = startOfWeek(day, { weekStartsOn: 1 });
    const end = endOfWeek(day, { weekStartsOn: 1 });
    return calendarEvents.filter(e => isWithinInterval(new Date(e.startDate), { start, end }));
  }, [calendarEvents]);
  const getEventsForMonth = useCallback((day: Date) => {
    const start = startOfMonth(day);
    const end = endOfMonth(day);
    return calendarEvents.filter(e => isWithinInterval(new Date(e.startDate), { start, end }));
  }, [calendarEvents]);
  const getUpcomingEvents = useCallback((limit: number) => {
    return calendarEvents
      .filter(e => !e.completed && isFuture(new Date(e.startDate)))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, limit);
  }, [calendarEvents]);

  // CRUD Operations
  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('clients').insert({ ...client, user_id: user.id }).select().single();
    if (error) { toast.error('Erro ao adicionar cliente'); return; }
    setClients(prev => [{ ...data, createdAt: new Date(data.created_at) } as any, ...prev]);
    toast.success('Cliente adicionado');
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(updates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar cliente'); return; }
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    toast.success('Cliente atualizado');
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar cliente'); return; }
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('Cliente eliminado');
  };

  const addProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('projects').insert({
      name: project.name,
      client_id: project.clientId,
      type: project.type,
      location: project.location,
      description: project.description,
      start_date: project.startDate.toISOString(),
      deadline: project.deadline.toISOString(),
      budget: project.budget,
      status: project.status,
      parent_project_id: project.parentProjectId,
      user_id: user.id
    }).select().single();
    if (error) { toast.error('Erro ao adicionar projecto'); return; }
    setProjects(prev => [{
      ...data,
      clientId: data.client_id,
      startDate: new Date(data.start_date),
      deadline: new Date(data.deadline),
      parentProjectId: data.parent_project_id,
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Projecto adicionado');
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const dbUpdates: any = { ...updates };
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.startDate) { dbUpdates.start_date = updates.startDate.toISOString(); delete dbUpdates.startDate; }
    if (updates.deadline) { dbUpdates.deadline = updates.deadline.toISOString(); delete dbUpdates.deadline; }
    
    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar projecto'); return; }
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    toast.success('Projecto atualizado');
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar projecto'); return; }
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success('Projecto eliminado');
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('transactions').insert({
      description: transaction.description,
      value: transaction.value,
      type: transaction.type,
      destination: transaction.destination,
      category: transaction.category,
      project_id: transaction.projectId,
      client_id: transaction.clientId,
      date: transaction.date.toISOString(),
      user_id: user.id
    }).select().single();
    if (error) { toast.error('Erro ao adicionar transação'); return; }
    setTransactions(prev => [{
      ...data,
      projectId: data.project_id,
      clientId: data.client_id,
      date: new Date(data.date),
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Transação registada');
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const dbUpdates: any = { ...updates };
    if (updates.projectId) { dbUpdates.project_id = updates.projectId; delete dbUpdates.projectId; }
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.date) { dbUpdates.date = updates.date.toISOString(); delete dbUpdates.date; }

    const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar transação'); return; }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    toast.success('Transação atualizada');
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar transação'); return; }
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transação eliminada');
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('tasks').insert({
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      responsible: task.responsible,
      deadline: task.deadline?.toISOString(),
      status: task.status,
      priority: task.priority,
      phase: task.phase,
      completion_percentage: task.completionPercentage,
      subtasks: task.subtasks,
      comments: task.comments,
      user_id: user.id
    }).select().single();
    if (error) { toast.error('Erro ao adicionar tarefa'); return; }
    setTasks(prev => [{
      ...data,
      projectId: data.project_id,
      deadline: data.deadline ? new Date(data.deadline) : null,
      completionPercentage: data.completion_percentage,
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Tarefa adicionada');
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const dbUpdates: any = { ...updates };
    if (updates.projectId) { dbUpdates.project_id = updates.projectId; delete dbUpdates.projectId; }
    if (updates.deadline) { dbUpdates.deadline = updates.deadline.toISOString(); delete dbUpdates.deadline; }
    if (updates.completionPercentage !== undefined) { dbUpdates.completion_percentage = updates.completionPercentage; delete dbUpdates.completionPercentage; }

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar tarefa'); return; }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar tarefa'); return; }
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Tarefa eliminada');
  };

  const addDeal = async (deal: Omit<Deal, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('deals').insert({
      title: deal.title,
      client_id: deal.clientId,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expected_close_date: deal.expectedCloseDate?.toISOString(),
      notes: deal.notes,
      user_id: user.id
    }).select().single();
    if (error) { toast.error('Erro ao adicionar negócio'); return; }
    setDeals(prev => [{
      ...data,
      clientId: data.client_id,
      expectedCloseDate: data.expected_close_date ? new Date(data.expected_close_date) : null,
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Negócio adicionado');
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const dbUpdates: any = { ...updates };
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.expectedCloseDate) { dbUpdates.expected_close_date = updates.expectedCloseDate.toISOString(); delete dbUpdates.expectedCloseDate; }

    const { error } = await supabase.from('deals').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar negócio'); return; }
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDeal = async (id: string) => {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar negócio'); return; }
    setDeals(prev => prev.filter(d => d.id !== id));
    toast.success('Negócio eliminado');
  };

  const moveDealToStage = async (id: string, stage: DealStage) => {
    const stageConfig = dealStageConfig.find(s => s.id === stage);
    await updateDeal(id, { stage, probability: stageConfig?.probability || 0 });
  };

  const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('calendar_events').insert({
      title: event.title,
      description: event.description,
      type: event.type,
      start_date: event.startDate.toISOString(),
      end_date: event.endDate.toISOString(),
      all_day: event.allDay,
      client_id: event.clientId,
      deal_id: event.dealId,
      reminder: event.reminder,
      completed: event.completed,
      user_id: user.id
    }).select().single();
    if (error) { toast.error('Erro ao adicionar evento'); return; }
    setCalendarEvents(prev => [{
      ...data,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      allDay: data.all_day,
      clientId: data.client_id,
      dealId: data.deal_id,
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Evento agendado');
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const dbUpdates: any = { ...updates };
    if (updates.startDate) { dbUpdates.start_date = updates.startDate.toISOString(); delete dbUpdates.startDate; }
    if (updates.endDate) { dbUpdates.end_date = updates.endDate.toISOString(); delete dbUpdates.endDate; }
    if (updates.allDay !== undefined) { dbUpdates.all_day = updates.allDay; delete dbUpdates.allDay; }
    if (updates.clientId) { dbUpdates.client_id = updates.clientId; delete dbUpdates.clientId; }
    if (updates.dealId) { dbUpdates.deal_id = updates.dealId; delete dbUpdates.dealId; }

    const { error } = await supabase.from('calendar_events').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar evento'); return; }
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteCalendarEvent = async (id: string) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar evento'); return; }
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    toast.success('Evento eliminado');
  };

  const addInteraction = async (clientId: string, interaction: Omit<ClientInteraction, 'id' | 'createdAt' | 'clientId'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('client_interactions').insert({
      client_id: clientId,
      type: interaction.type,
      description: interaction.description,
      date: interaction.date.toISOString(),
      user_id: user.id
    }).select().single();
    if (error) { toast.error('Erro ao registar interação'); return; }
    setInteractions(prev => [{
      ...data,
      clientId: data.client_id,
      date: new Date(data.date),
      createdAt: new Date(data.created_at)
    } as any, ...prev]);
    toast.success('Interação registada');
  };

  const deleteInteraction = async (clientId: string, interactionId: string) => {
    const { error } = await supabase.from('client_interactions').delete().eq('id', interactionId);
    if (error) { toast.error('Erro ao eliminar interação'); return; }
    setInteractions(prev => prev.filter(i => i.id !== interactionId));
    toast.success('Interação eliminada');
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'lastUpdated' | 'totalValue'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('inventory').insert({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_stock: item.minStock,
      unit_cost: item.unitCost,
      location: item.location,
      user_id: user.id
    }).select().single();
    if (error) { toast.error('Erro ao adicionar item ao inventário'); return; }
    setInventory(prev => [...prev, {
      id: data.id,
      name: data.name,
      category: data.category as any,
      quantity: Number(data.quantity),
      unit: data.unit,
      minStock: Number(data.min_stock),
      unitCost: Number(data.unit_cost),
      totalValue: Number(data.quantity) * Number(data.unit_cost),
      location: data.location,
      lastUpdated: new Date(data.updated_at),
      createdAt: new Date(data.created_at)
    }]);
    toast.success('Item adicionado ao inventário');
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    const dbUpdates: any = { ...updates };
    if (updates.minStock !== undefined) { dbUpdates.min_stock = updates.minStock; delete dbUpdates.minStock; }
    if (updates.unitCost !== undefined) { dbUpdates.unit_cost = updates.unitCost; delete dbUpdates.unitCost; }

    const { error } = await supabase.from('inventory').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar item'); return; }
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        return { ...updated, totalValue: updated.quantity * updated.unitCost, lastUpdated: new Date() };
      }
      return item;
    }));
  };

  const deleteInventoryItem = async (id: string) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) { toast.error('Erro ao eliminar item'); return; }
    setInventory(prev => prev.filter(i => i.id !== id));
    toast.success('Item eliminado do inventário');
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
    clients, projects, transactions, tasks, deals, calendarEvents, inventory, loading,
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
    clients, projects, transactions, tasks, deals, calendarEvents, inventory, loading,
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