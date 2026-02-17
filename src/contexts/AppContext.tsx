import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Client, Project, Transaction, Task, ProjectWithDetails, DashboardMetrics, MonthlyFlow, TaskStatus, ProjectStatus, ProjectKPIs, Deal, DealStage, DealStageConfig, CalendarEvent, CalendarEventType, ClientInteraction, InteractionType } from '@/types';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth, differenceInDays, isPast, isFuture, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Deal stage configuration with probabilities
export const dealStageConfig: DealStageConfig[] = [
  { id: 'lead', label: 'Lead', probability: 10, color: 'from-slate-500 to-slate-600' },
  { id: 'qualification', label: 'Qualificação', probability: 25, color: 'from-blue-500 to-blue-600' },
  { id: 'proposal', label: 'Proposta', probability: 50, color: 'from-amber-500 to-amber-600' },
  { id: 'negotiation', label: 'Negociação', probability: 75, color: 'from-purple-500 to-purple-600' },
  { id: 'won', label: 'Ganhou', probability: 100, color: 'from-emerald-500 to-emerald-600' },
  { id: 'lost', label: 'Perdeu', probability: 0, color: 'from-rose-500 to-rose-600' },
];

interface AppContextType {
  // Data
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
  tasks: Task[];
  deals: Deal[];
  calendarEvents: CalendarEvent[];
  loading: boolean;
  
  // Client operations
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'interactions'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInteraction: (clientId: string, interaction: Omit<ClientInteraction, 'id' | 'createdAt' | 'clientId'>) => Promise<void>;
  deleteInteraction: (clientId: string, interactionId: string) => Promise<void>;
  getClientInteractions: (clientId: string) => ClientInteraction[];
  
  // Project operations
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'history'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getSubprojects: (projectId: string) => Project[];
  
  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getProjectTasks: (projectId: string) => Task[];
  
  // Deal operations
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Promise<void>;
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  moveDealToStage: (dealId: string, newStage: DealStage) => Promise<void>;
  getClientDeals: (clientId: string) => Deal[];
  getDealsByStage: (stage: DealStage) => Deal[];
  getPipelineMetrics: () => { totalValue: number; weightedValue: number; dealsByStage: Record<DealStage, number>; stageValues: Record<DealStage, number> };
  
  // Calendar operations
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<void>;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  getEventsForDay: (date: Date) => CalendarEvent[];
  getEventsForWeek: (date: Date) => CalendarEvent[];
  getEventsForMonth: (date: Date) => CalendarEvent[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
  
  // Computed data
  getProjectWithDetails: (projectId: string) => ProjectWithDetails | undefined;
  getClientProjects: (clientId: string) => Project[];
  getProjectTransactions: (projectId: string) => Transaction[];
  getDashboardMetrics: () => DashboardMetrics;
  getProjectKPIs: (projectId: string) => ProjectKPIs;
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
  const [projectHistories, setProjectHistories] = useState<Record<string, Project['history']>>({});
  const [loading, setLoading] = useState(true);

  // ==================== FETCH ALL DATA ====================
  useEffect(() => {
    if (!user) {
      setClients([]);
      setProjects([]);
      setTransactions([]);
      setTasks([]);
      setDeals([]);
      setCalendarEvents([]);
      setProjectHistories({});
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [clientsRes, projectsRes, transactionsRes, tasksRes, dealsRes, eventsRes, historyRes, interactionsRes] = await Promise.all([
          supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('deals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('calendar_events').select('*').eq('user_id', user.id).order('start_date', { ascending: true }),
          supabase.from('project_history').select('*').eq('user_id', user.id).order('date', { ascending: true }),
          supabase.from('client_interactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        ]);

        // Build interactions map by client_id
        const interactionsMap: Record<string, ClientInteraction[]> = {};
        (interactionsRes.data || []).forEach((row: any) => {
          const interaction: ClientInteraction = {
            id: row.id,
            clientId: row.client_id,
            type: row.type as InteractionType,
            description: row.description,
            date: new Date(row.date),
            createdAt: new Date(row.created_at),
          };
          if (!interactionsMap[row.client_id]) interactionsMap[row.client_id] = [];
          interactionsMap[row.client_id].push(interaction);
        });

        // Map clients
        setClients((clientsRes.data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          company: row.company,
          position: row.position,
          address: row.address,
          notes: row.notes,
          status: row.status as Client['status'],
          createdAt: new Date(row.created_at),
          interactions: interactionsMap[row.id] || [],
        })));

        // Build history map
        const histMap: Record<string, Project['history']> = {};
        (historyRes.data || []).forEach((row: any) => {
          if (!histMap[row.project_id]) histMap[row.project_id] = [];
          histMap[row.project_id].push({
            id: row.id,
            action: row.action,
            description: row.description,
            date: new Date(row.date),
          });
        });
        setProjectHistories(histMap);

        // Map projects
        setProjects((projectsRes.data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          clientId: row.client_id || '',
          type: row.type as Project['type'],
          location: row.location,
          description: row.description,
          startDate: new Date(row.start_date),
          deadline: new Date(row.deadline),
          budget: Number(row.budget),
          status: row.status as ProjectStatus,
          createdAt: new Date(row.created_at),
          history: histMap[row.id] || [],
          parentProjectId: row.parent_project_id || null,
        })));

        // Map transactions
        setTransactions((transactionsRes.data || []).map((row: any) => ({
          id: row.id,
          description: row.description,
          value: Number(row.value),
          type: row.type as Transaction['type'],
          destination: row.destination as Transaction['destination'],
          category: row.category as Transaction['category'],
          projectId: row.project_id || null,
          clientId: row.client_id || null,
          date: new Date(row.date),
          createdAt: new Date(row.created_at),
        })));

        // Map tasks
        setTasks((tasksRes.data || []).map((row: any) => ({
          id: row.id,
          projectId: row.project_id,
          title: row.title,
          description: row.description,
          responsible: row.responsible,
          deadline: row.deadline ? new Date(row.deadline) : null,
          status: row.status as TaskStatus,
          priority: row.priority as Task['priority'],
          phase: row.phase as Task['phase'],
          completionPercentage: Number(row.completion_percentage),
          subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
          comments: Array.isArray(row.comments) ? row.comments : [],
          createdAt: new Date(row.created_at),
        })));

        // Map deals
        setDeals((dealsRes.data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          clientId: row.client_id || '',
          value: Number(row.value),
          stage: row.stage as DealStage,
          probability: Number(row.probability),
          expectedCloseDate: row.expected_close_date ? new Date(row.expected_close_date) : null,
          notes: row.notes,
          createdAt: new Date(row.created_at),
        })));

        // Map calendar events
        setCalendarEvents((eventsRes.data || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          type: row.type as CalendarEventType,
          startDate: new Date(row.start_date),
          endDate: new Date(row.end_date),
          allDay: row.all_day,
          clientId: row.client_id || null,
          dealId: row.deal_id || null,
          reminder: row.reminder,
          completed: row.completed,
          createdAt: new Date(row.created_at),
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  // ==================== CLIENT OPERATIONS ====================
  const addClient = useCallback(async (client: Omit<Client, 'id' | 'createdAt' | 'interactions'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('clients').insert({
      user_id: user.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      position: client.position,
      address: client.address,
      notes: client.notes,
      status: client.status,
    }).select().single();
    if (error) { console.error('Error adding client:', error); return; }
    if (data) {
      setClients(prev => [{
        id: data.id, name: data.name, email: data.email, phone: data.phone,
        company: data.company, position: data.position, address: data.address,
        notes: data.notes, status: data.status as Client['status'],
        createdAt: new Date(data.created_at), interactions: [],
      }, ...prev]);
    }
  }, [user]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    
    const { error } = await supabase.from('clients').update(dbUpdates).eq('id', id);
    if (error) { console.error('Error updating client:', error); return; }
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [user]);

  const deleteClient = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) { console.error('Error deleting client:', error); return; }
    setClients(prev => prev.filter(c => c.id !== id));
  }, [user]);

  const addInteraction = useCallback(async (clientId: string, interaction: Omit<ClientInteraction, 'id' | 'createdAt' | 'clientId'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('client_interactions').insert({
      user_id: user.id,
      client_id: clientId,
      type: interaction.type,
      description: interaction.description,
      date: interaction.date.toISOString(),
    }).select().single();
    if (error) { console.error('Error adding interaction:', error); return; }
    if (data) {
      const newInteraction: ClientInteraction = {
        id: data.id, clientId: data.client_id, type: data.type as InteractionType,
        description: data.description, date: new Date(data.date), createdAt: new Date(data.created_at),
      };
      setClients(prev => prev.map(c =>
        c.id === clientId ? { ...c, interactions: [newInteraction, ...c.interactions] } : c
      ));
    }
  }, [user]);

  const deleteInteraction = useCallback(async (clientId: string, interactionId: string) => {
    if (!user) return;
    const { error } = await supabase.from('client_interactions').delete().eq('id', interactionId);
    if (error) { console.error('Error deleting interaction:', error); return; }
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, interactions: c.interactions.filter(i => i.id !== interactionId) } : c
    ));
  }, [user]);

  const getClientInteractions = useCallback((clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.interactions || [];
  }, [clients]);

  // ==================== PROJECT OPERATIONS ====================
  const addProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'history'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('projects').insert({
      user_id: user.id,
      name: project.name,
      client_id: project.clientId || null,
      type: project.type,
      location: project.location,
      description: project.description,
      start_date: project.startDate.toISOString(),
      deadline: project.deadline.toISOString(),
      budget: project.budget,
      status: project.status,
      parent_project_id: project.parentProjectId || null,
    }).select().single();
    if (error) { console.error('Error adding project:', error); return; }
    if (data) {
      // Add initial history entry
      const { data: histData } = await supabase.from('project_history').insert({
        project_id: data.id,
        user_id: user.id,
        action: 'Criação',
        description: 'Projecto criado',
      }).select().single();

      const history = histData ? [{ id: histData.id, action: histData.action, description: histData.description, date: new Date(histData.date) }] : [];
      
      setProjects(prev => [{
        id: data.id, name: data.name, clientId: data.client_id || '',
        type: data.type as Project['type'], location: data.location, description: data.description,
        startDate: new Date(data.start_date), deadline: new Date(data.deadline),
        budget: Number(data.budget), status: data.status as ProjectStatus,
        createdAt: new Date(data.created_at), history, parentProjectId: data.parent_project_id || null,
      }, ...prev]);
    }
  }, [user]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId || null;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate.toISOString();
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline.toISOString();
    if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.parentProjectId !== undefined) dbUpdates.parent_project_id = updates.parentProjectId || null;

    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
    if (error) { console.error('Error updating project:', error); return; }

    // Add history for status changes
    const currentProject = projects.find(p => p.id === id);
    if (updates.status && currentProject && updates.status !== currentProject.status) {
      const { data: histData } = await supabase.from('project_history').insert({
        project_id: id,
        user_id: user.id,
        action: 'Alteração de estado',
        description: `De ${currentProject.status} para ${updates.status}`,
      }).select().single();

      if (histData) {
        setProjects(prev => prev.map(p => {
          if (p.id === id) {
            const newHistory = [...p.history, { id: histData.id, action: histData.action, description: histData.description, date: new Date(histData.date) }];
            return { ...p, ...updates, history: newHistory };
          }
          return p;
        }));
        return;
      }
    }

    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [user, projects]);

  const deleteProject = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { console.error('Error deleting project:', error); return; }
    setProjects(prev => prev.filter(p => p.id !== id && p.parentProjectId !== id));
  }, [user]);

  const getSubprojects = useCallback((projectId: string) => {
    return projects.filter(p => p.parentProjectId === projectId);
  }, [projects]);

  // ==================== TRANSACTION OPERATIONS ====================
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      description: transaction.description,
      value: transaction.value,
      type: transaction.type,
      destination: transaction.destination,
      category: transaction.category,
      project_id: transaction.projectId || null,
      client_id: transaction.clientId || null,
      date: transaction.date.toISOString(),
    }).select().single();
    if (error) { console.error('Error adding transaction:', error); return; }
    if (data) {
      setTransactions(prev => [{
        id: data.id, description: data.description, value: Number(data.value),
        type: data.type as Transaction['type'], destination: data.destination as Transaction['destination'],
        category: data.category as Transaction['category'],
        projectId: data.project_id || null, clientId: data.client_id || null,
        date: new Date(data.date), createdAt: new Date(data.created_at),
      }, ...prev]);
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.value !== undefined) dbUpdates.value = updates.value;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.date !== undefined) dbUpdates.date = updates.date.toISOString();

    const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', id);
    if (error) { console.error('Error updating transaction:', error); return; }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) { console.error('Error deleting transaction:', error); return; }
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [user]);

  // ==================== TASK OPERATIONS ====================
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      responsible: task.responsible,
      deadline: task.deadline ? task.deadline.toISOString() : null,
      status: task.status,
      priority: task.priority,
      phase: task.phase,
      completion_percentage: task.completionPercentage,
      subtasks: task.subtasks as any,
      comments: task.comments as any,
    }).select().single();
    if (error) { console.error('Error adding task:', error); return; }
    if (data) {
      setTasks(prev => [{
        id: data.id, projectId: data.project_id, title: data.title,
        description: data.description, responsible: data.responsible,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: data.status as TaskStatus, priority: data.priority as Task['priority'],
        phase: data.phase as Task['phase'], completionPercentage: Number(data.completion_percentage),
        subtasks: Array.isArray(data.subtasks) ? data.subtasks as any : [],
        comments: Array.isArray(data.comments) ? data.comments as any : [],
        createdAt: new Date(data.created_at),
      }, ...prev]);
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.responsible !== undefined) dbUpdates.responsible = updates.responsible;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline ? updates.deadline.toISOString() : null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.phase !== undefined) dbUpdates.phase = updates.phase;
    if (updates.completionPercentage !== undefined) dbUpdates.completion_percentage = updates.completionPercentage;
    if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
    if (updates.comments !== undefined) dbUpdates.comments = updates.comments;

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (error) { console.error('Error updating task:', error); return; }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) { console.error('Error deleting task:', error); return; }
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [user]);

  const getProjectTasks = useCallback((projectId: string) => {
    return tasks.filter(t => t.projectId === projectId);
  }, [tasks]);

  // ==================== DEAL OPERATIONS ====================
  const addDeal = useCallback(async (deal: Omit<Deal, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('deals').insert({
      user_id: user.id,
      title: deal.title,
      client_id: deal.clientId || null,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expected_close_date: deal.expectedCloseDate ? deal.expectedCloseDate.toISOString() : null,
      notes: deal.notes,
    }).select().single();
    if (error) { console.error('Error adding deal:', error); return; }
    if (data) {
      setDeals(prev => [{
        id: data.id, title: data.title, clientId: data.client_id || '',
        value: Number(data.value), stage: data.stage as DealStage,
        probability: Number(data.probability),
        expectedCloseDate: data.expected_close_date ? new Date(data.expected_close_date) : null,
        notes: data.notes, createdAt: new Date(data.created_at),
      }, ...prev]);
    }
  }, [user]);

  const updateDeal = useCallback(async (id: string, updates: Partial<Deal>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId || null;
    if (updates.value !== undefined) dbUpdates.value = updates.value;
    if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
    if (updates.probability !== undefined) dbUpdates.probability = updates.probability;
    if (updates.expectedCloseDate !== undefined) dbUpdates.expected_close_date = updates.expectedCloseDate ? updates.expectedCloseDate.toISOString() : null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase.from('deals').update(dbUpdates).eq('id', id);
    if (error) { console.error('Error updating deal:', error); return; }
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [user]);

  const deleteDeal = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) { console.error('Error deleting deal:', error); return; }
    setDeals(prev => prev.filter(d => d.id !== id));
  }, [user]);

  const moveDealToStage = useCallback(async (dealId: string, newStage: DealStage) => {
    const stageConfig = dealStageConfig.find(s => s.id === newStage);
    const probability = stageConfig?.probability || 0;
    
    if (!user) return;
    const { error } = await supabase.from('deals').update({ stage: newStage, probability }).eq('id', dealId);
    if (error) { console.error('Error moving deal:', error); return; }
    setDeals(prev => prev.map(d =>
      d.id === dealId ? { ...d, stage: newStage, probability } : d
    ));
  }, [user]);

  const getClientDeals = useCallback((clientId: string) => {
    return deals.filter(d => d.clientId === clientId);
  }, [deals]);

  const getDealsByStage = useCallback((stage: DealStage) => {
    return deals.filter(d => d.stage === stage);
  }, [deals]);

  const getPipelineMetrics = useCallback(() => {
    const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
    const totalValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const weightedValue = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);
    
    const dealsByStage: Record<DealStage, number> = {
      lead: deals.filter(d => d.stage === 'lead').length,
      qualification: deals.filter(d => d.stage === 'qualification').length,
      proposal: deals.filter(d => d.stage === 'proposal').length,
      negotiation: deals.filter(d => d.stage === 'negotiation').length,
      won: deals.filter(d => d.stage === 'won').length,
      lost: deals.filter(d => d.stage === 'lost').length,
    };

    const stageValues: Record<DealStage, number> = {
      lead: deals.filter(d => d.stage === 'lead').reduce((sum, d) => sum + d.value, 0),
      qualification: deals.filter(d => d.stage === 'qualification').reduce((sum, d) => sum + d.value, 0),
      proposal: deals.filter(d => d.stage === 'proposal').reduce((sum, d) => sum + d.value, 0),
      negotiation: deals.filter(d => d.stage === 'negotiation').reduce((sum, d) => sum + d.value, 0),
      won: deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0),
      lost: deals.filter(d => d.stage === 'lost').reduce((sum, d) => sum + d.value, 0),
    };

    return { totalValue, weightedValue, dealsByStage, stageValues };
  }, [deals]);

  // ==================== CALENDAR OPERATIONS ====================
  const addCalendarEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('calendar_events').insert({
      user_id: user.id,
      title: event.title,
      description: event.description,
      type: event.type,
      start_date: event.startDate.toISOString(),
      end_date: event.endDate.toISOString(),
      all_day: event.allDay,
      client_id: event.clientId || null,
      deal_id: event.dealId || null,
      reminder: event.reminder,
      completed: event.completed,
    }).select().single();
    if (error) { console.error('Error adding calendar event:', error); return; }
    if (data) {
      setCalendarEvents(prev => [...prev, {
        id: data.id, title: data.title, description: data.description,
        type: data.type as CalendarEventType,
        startDate: new Date(data.start_date), endDate: new Date(data.end_date),
        allDay: data.all_day, clientId: data.client_id || null, dealId: data.deal_id || null,
        reminder: data.reminder, completed: data.completed, createdAt: new Date(data.created_at),
      }]);
    }
  }, [user]);

  const updateCalendarEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate.toISOString();
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate.toISOString();
    if (updates.allDay !== undefined) dbUpdates.all_day = updates.allDay;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.dealId !== undefined) dbUpdates.deal_id = updates.dealId;
    if (updates.reminder !== undefined) dbUpdates.reminder = updates.reminder;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

    const { error } = await supabase.from('calendar_events').update(dbUpdates).eq('id', id);
    if (error) { console.error('Error updating calendar event:', error); return; }
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [user]);

  const deleteCalendarEvent = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) { console.error('Error deleting calendar event:', error); return; }
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  }, [user]);

  const getEventsForDay = useCallback((date: Date) => {
    return calendarEvents.filter(e => isSameDay(new Date(e.startDate), date));
  }, [calendarEvents]);

  const getEventsForWeek = useCallback((date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    return calendarEvents.filter(e => {
      const eventDate = new Date(e.startDate);
      return isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
    });
  }, [calendarEvents]);

  const getEventsForMonth = useCallback((date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return calendarEvents.filter(e => {
      const eventDate = new Date(e.startDate);
      return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
    });
  }, [calendarEvents]);

  const getUpcomingEvents = useCallback((limit: number = 5) => {
    const now = new Date();
    return calendarEvents
      .filter(e => new Date(e.startDate) >= now && !e.completed)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, limit);
  }, [calendarEvents]);

  // ==================== COMPUTED DATA ====================
  const getProjectTransactions = useCallback((projectId: string) => {
    return transactions.filter(t => t.projectId === projectId);
  }, [transactions]);

  const getClientProjects = useCallback((clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  }, [projects]);

  const getProjectKPIs = useCallback((projectId: string): ProjectKPIs => {
    const project = projects.find(p => p.id === projectId);
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectTransactions = transactions.filter(t => t.projectId === projectId);

    const totalIncome = projectTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = projectTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
    const budget = project?.budget || 0;

    const tasksByStatus: Record<TaskStatus, number> = {
      todo: projectTasks.filter(t => t.status === 'todo').length,
      doing: projectTasks.filter(t => t.status === 'doing').length,
      review: projectTasks.filter(t => t.status === 'review').length,
      done: projectTasks.filter(t => t.status === 'done').length,
    };

    const overdueTasks = projectTasks.filter(t =>
      t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done'
    ).length;

    const progressPercentage = projectTasks.length > 0
      ? Math.round(projectTasks.reduce((sum, t) => sum + t.completionPercentage, 0) / projectTasks.length)
      : 0;

    const deadlineDeviation = project
      ? differenceInDays(new Date(), new Date(project.deadline))
      : 0;

    return {
      progressPercentage,
      tasksByStatus,
      overdueTasks,
      deadlineDeviation,
      budgetUsed: totalExpenses,
      budgetRemaining: budget - totalExpenses,
      budgetPercentage: budget > 0 ? Math.round((totalExpenses / budget) * 100) : 0,
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
    };
  }, [projects, tasks, transactions]);

  const getProjectWithDetails = useCallback((projectId: string): ProjectWithDetails | undefined => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const client = clients.find(c => c.id === project.clientId);
    const projectTransactions = getProjectTransactions(projectId);
    const projectTasks = getProjectTasks(projectId);
    const kpis = getProjectKPIs(projectId);

    return {
      ...project,
      client,
      transactions: projectTransactions,
      tasks: projectTasks,
      kpis,
    };
  }, [projects, clients, getProjectTransactions, getProjectTasks, getProjectKPIs]);

  const getDashboardMetrics = useCallback((): DashboardMetrics => {
    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
    const currentBalance = totalRevenue - totalExpenses;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const leadsInFunnel = clients.filter(c => c.status === 'lead').length;

    const projectsByStatus: Record<ProjectStatus, number> = {
      planning: projects.filter(p => p.status === 'planning').length,
      in_progress: projects.filter(p => p.status === 'in_progress').length,
      paused: projects.filter(p => p.status === 'paused').length,
      completed: projects.filter(p => p.status === 'completed').length,
    };

    const recentProjects = [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const monthlyFlow: MonthlyFlow[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthTransactions = transactions.filter(t =>
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
      );
      
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
      
      monthlyFlow.push({
        month: format(monthDate, 'MMM', { locale: ptBR }),
        income,
        expenses,
      });
    }

    return {
      totalRevenue,
      currentBalance,
      activeProjects,
      completedProjects,
      activeClients,
      leadsInFunnel,
      projectsByStatus,
      recentProjects,
      monthlyFlow,
    };
  }, [transactions, projects, clients]);

  const value = useMemo(() => ({
    clients,
    projects,
    transactions,
    tasks,
    deals,
    loading,
    addClient,
    updateClient,
    deleteClient,
    addInteraction,
    deleteInteraction,
    getClientInteractions,
    addProject,
    updateProject,
    deleteProject,
    getSubprojects,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTask,
    updateTask,
    deleteTask,
    getProjectTasks,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDealToStage,
    getClientDeals,
    getDealsByStage,
    getPipelineMetrics,
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getEventsForDay,
    getEventsForWeek,
    getEventsForMonth,
    getUpcomingEvents,
    getProjectWithDetails,
    getClientProjects,
    getProjectTransactions,
    getDashboardMetrics,
    getProjectKPIs,
  }), [
    clients, projects, transactions, tasks, deals, calendarEvents, loading,
    addClient, updateClient, deleteClient, addInteraction, deleteInteraction, getClientInteractions,
    addProject, updateProject, deleteProject, getSubprojects,
    addTransaction, updateTransaction, deleteTransaction,
    addTask, updateTask, deleteTask, getProjectTasks,
    addDeal, updateDeal, deleteDeal, moveDealToStage, getClientDeals, getDealsByStage, getPipelineMetrics,
    addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getEventsForDay, getEventsForWeek, getEventsForMonth, getUpcomingEvents,
    getProjectWithDetails, getClientProjects, getProjectTransactions, getDashboardMetrics, getProjectKPIs,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
