import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Client, Project, Transaction, Task, ProjectWithDetails, DashboardMetrics, MonthlyFlow, TaskStatus, ProjectStatus, ProjectKPIs, Deal, DealStage, DealStageConfig, CalendarEvent, CalendarEventType } from '@/types';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth, differenceInDays, isPast, isFuture, addDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Deal stage configuration with probabilities
export const dealStageConfig: DealStageConfig[] = [
  { id: 'lead', label: 'Lead', probability: 10, color: 'from-slate-500 to-slate-600' },
  { id: 'qualification', label: 'Qualificação', probability: 25, color: 'from-blue-500 to-blue-600' },
  { id: 'proposal', label: 'Proposta', probability: 50, color: 'from-amber-500 to-amber-600' },
  { id: 'negotiation', label: 'Negociação', probability: 75, color: 'from-purple-500 to-purple-600' },
  { id: 'won', label: 'Ganhou', probability: 100, color: 'from-emerald-500 to-emerald-600' },
  { id: 'lost', label: 'Perdeu', probability: 0, color: 'from-rose-500 to-rose-600' },
];

// Initial mock data
const initialClients: Client[] = [
  { id: '1', name: 'Tech Solutions Ltda', email: 'contato@techsolutions.com', phone: '+244 923 456 789', company: 'Tech Solutions', position: 'CEO', address: 'Rua da Inovação, 123, Luanda', notes: 'Cliente premium desde 2024', status: 'active', createdAt: new Date('2025-09-15') },
  { id: '2', name: 'Carlos Startup', email: 'ola@startupdigital.io', phone: '+244 912 345 678', company: 'Startup Digital', position: 'Fundador', address: 'Av. Marginal, 456, Luanda', notes: 'Interessado em app mobile', status: 'lead', createdAt: new Date('2025-10-20') },
  { id: '3', name: 'Maria Express', email: 'vendas@comercioexpress.com.br', phone: '+244 934 567 890', company: 'Comércio Express', position: 'Directora Comercial', address: 'Bairro Maculusso, Luanda', notes: 'Projecto e-commerce em andamento', status: 'active', createdAt: new Date('2025-11-10') },
  { id: '4', name: 'João Criativo', email: 'projetos@agenciacriativa.com', phone: '+244 945 678 901', company: 'Agência Criativa', position: 'Director Criativo', address: 'Talatona, Luanda Sul', notes: 'Projecto anterior concluído com sucesso', status: 'inactive', createdAt: new Date('2025-07-05') },
  { id: '5', name: 'Ana Fintech', email: 'dev@fintechbrasil.com', phone: '+244 956 789 012', company: 'Fintech Angola', position: 'CTO', address: 'Ilha de Luanda', notes: 'Novo lead via referência', status: 'lead', createdAt: new Date('2025-12-01') },
];

const initialProjects: Project[] = [
  { 
    id: '1', 
    name: 'Edifício Comercial Talatona', 
    clientId: '1', 
    type: 'architecture',
    location: 'Talatona, Luanda Sul',
    description: 'Projecto arquitectónico de edifício comercial de 8 andares com estacionamento subterrâneo',
    startDate: new Date('2025-09-20'),
    deadline: new Date('2026-06-30'), 
    budget: 45000000, 
    status: 'in_progress', 
    createdAt: new Date('2025-09-20'),
    parentProjectId: null,
    history: [
      { id: 'h1', action: 'Criação', description: 'Projecto criado', date: new Date('2025-09-20') },
      { id: 'h2', action: 'Alteração de estado', description: 'De Planeamento para Em Execução', date: new Date('2025-10-01') }
    ]
  },
  { 
    id: '2', 
    name: 'Residência Miramar', 
    clientId: '3', 
    type: 'interior_design',
    location: 'Miramar, Luanda',
    description: 'Design de interiores para moradia de luxo com 4 quartos e áreas sociais',
    startDate: new Date('2025-10-01'),
    deadline: new Date('2026-02-15'), 
    budget: 12000000, 
    status: 'in_progress', 
    createdAt: new Date('2025-10-01'),
    parentProjectId: null,
    history: []
  },
  { 
    id: '3', 
    name: 'Moradia Alvalade', 
    clientId: '1', 
    type: 'construction',
    location: 'Alvalade, Luanda',
    description: 'Construção civil de moradia unifamiliar T4 com piscina',
    startDate: new Date('2025-10-15'),
    deadline: new Date('2025-12-30'), 
    budget: 25000000, 
    status: 'completed', 
    createdAt: new Date('2025-10-15'),
    parentProjectId: null,
    history: []
  },
  { 
    id: '4', 
    name: 'Centro de Convenções Viana', 
    clientId: '3', 
    type: 'architecture',
    location: 'Viana, Luanda',
    description: 'Projecto de centro de convenções com capacidade para 500 pessoas',
    startDate: new Date('2025-12-10'),
    deadline: new Date('2026-12-20'), 
    budget: 85000000, 
    status: 'planning', 
    createdAt: new Date('2025-12-10'),
    parentProjectId: null,
    history: []
  },
  { 
    id: '5', 
    name: 'Reabilitação Hotel Marginal', 
    clientId: '1', 
    type: 'construction',
    location: 'Marginal, Luanda',
    description: 'Reabilitação completa de hotel histórico na marginal',
    startDate: new Date('2025-11-01'),
    deadline: new Date('2026-08-01'), 
    budget: 120000000, 
    status: 'paused', 
    createdAt: new Date('2025-11-01'),
    parentProjectId: null,
    history: [
      { id: 'h3', action: 'Pausa', description: 'Projecto pausado por questões de licenciamento', date: new Date('2025-12-15') }
    ]
  },
];

const initialTransactions: Transaction[] = [
  { id: '1', description: 'Entrada - Edifício Talatona (Parcela 1)', value: 15000000, type: 'income', destination: 'project', category: null, projectId: '1', clientId: '1', date: new Date('2025-09-25'), createdAt: new Date('2025-09-25') },
  { id: '2', description: 'Material de construção', value: 2500000, type: 'expense', destination: 'project', category: 'material', projectId: '1', clientId: '1', date: new Date('2025-10-01'), createdAt: new Date('2025-10-01') },
  { id: '3', description: 'Entrada - Residência Miramar (Sinal)', value: 4000000, type: 'income', destination: 'project', category: null, projectId: '2', clientId: '3', date: new Date('2025-10-05'), createdAt: new Date('2025-10-05') },
  { id: '4', description: 'Mobiliário e decoração', value: 1500000, type: 'expense', destination: 'project', category: 'material', projectId: '2', clientId: '3', date: new Date('2025-10-10'), createdAt: new Date('2025-10-10') },
  { id: '5', description: 'Entrada - Moradia Alvalade (Total)', value: 25000000, type: 'income', destination: 'project', category: null, projectId: '3', clientId: '1', date: new Date('2025-11-20'), createdAt: new Date('2025-11-20') },
  { id: '6', description: 'Mão de obra especializada', value: 8000000, type: 'expense', destination: 'project', category: 'servicos', projectId: '3', clientId: '1', date: new Date('2025-11-22'), createdAt: new Date('2025-11-22') },
  { id: '7', description: 'Entrada - Edifício Talatona (Parcela 2)', value: 15000000, type: 'income', destination: 'project', category: null, projectId: '1', clientId: '1', date: new Date('2025-12-01'), createdAt: new Date('2025-12-01') },
  { id: '8', description: 'Equipamentos de construção', value: 5000000, type: 'expense', destination: 'project', category: 'equipamento', projectId: '1', clientId: '1', date: new Date('2025-12-15'), createdAt: new Date('2025-12-15') },
  { id: '9', description: 'Entrada - Residência Miramar (Parcela 2)', value: 4000000, type: 'income', destination: 'project', category: null, projectId: '2', clientId: '3', date: new Date('2026-01-10'), createdAt: new Date('2026-01-10') },
  { id: '10', description: 'Iluminação decorativa', value: 800000, type: 'expense', destination: 'project', category: 'material', projectId: '2', clientId: '3', date: new Date('2026-01-15'), createdAt: new Date('2026-01-15') },
  // Fluxo de Caixa - Despesas variáveis da empresa
  { id: '11', description: 'Almoço equipa de obra', value: 45000, type: 'expense', destination: 'cashflow', category: 'alimentacao', projectId: null, clientId: null, date: new Date('2026-01-20'), createdAt: new Date('2026-01-20') },
  { id: '12', description: 'Combustível viatura empresa', value: 120000, type: 'expense', destination: 'cashflow', category: 'transporte', projectId: null, clientId: null, date: new Date('2026-01-22'), createdAt: new Date('2026-01-22') },
  { id: '13', description: 'Material de escritório', value: 35000, type: 'expense', destination: 'cashflow', category: 'material', projectId: null, clientId: null, date: new Date('2026-01-25'), createdAt: new Date('2026-01-25') },
  { id: '14', description: 'Internet e telefone', value: 85000, type: 'expense', destination: 'cashflow', category: 'comunicacao', projectId: null, clientId: null, date: new Date('2026-02-01'), createdAt: new Date('2026-02-01') },
  { id: '15', description: 'Renda do escritório', value: 350000, type: 'expense', destination: 'cashflow', category: 'renda', projectId: null, clientId: null, date: new Date('2026-02-01'), createdAt: new Date('2026-02-01') },
  { id: '16', description: 'Táxi para reunião cliente', value: 15000, type: 'expense', destination: 'cashflow', category: 'transporte', projectId: null, clientId: null, date: new Date('2026-02-05'), createdAt: new Date('2026-02-05') },
];

const initialTasks: Task[] = [
  { id: '1', projectId: '1', title: 'Levantamento topográfico', description: 'Realizar levantamento topográfico completo do terreno', responsible: 'João Silva', deadline: new Date('2025-10-01'), status: 'done', priority: 'high', phase: 'projeto', completionPercentage: 100, subtasks: [{ id: 's1', title: 'Contratação de topógrafo', completed: true }, { id: 's2', title: 'Entrega do relatório', completed: true }], comments: [], createdAt: new Date('2025-09-20') },
  { id: '2', projectId: '1', title: 'Projecto de fundações', description: 'Desenvolver projecto estrutural de fundações', responsible: 'Maria Santos', deadline: new Date('2026-01-15'), status: 'doing', priority: 'critical', phase: 'projeto', completionPercentage: 60, subtasks: [{ id: 's3', title: 'Estudo geotécnico', completed: true }, { id: 's4', title: 'Cálculo estrutural', completed: false }], comments: [], createdAt: new Date('2025-10-01') },
  { id: '3', projectId: '1', title: 'Aprovação camarária', description: 'Submeter projecto para aprovação municipal', responsible: 'Pedro Costa', deadline: new Date('2026-02-01'), status: 'todo', priority: 'high', phase: 'projeto', completionPercentage: 0, subtasks: [], comments: [], createdAt: new Date('2025-11-01') },
  { id: '4', projectId: '1', title: 'Revisão arquitectónica', description: 'Revisão final do projecto arquitectónico', responsible: 'Ana Lima', deadline: new Date('2026-01-30'), status: 'review', priority: 'medium', phase: 'projeto', completionPercentage: 80, subtasks: [], comments: [], createdAt: new Date('2025-12-01') },
  { id: '5', projectId: '2', title: 'Moodboard e conceito', description: 'Criar moodboard com conceito de design', responsible: 'Ana Lima', deadline: new Date('2025-11-15'), status: 'done', priority: 'high', phase: 'projeto', completionPercentage: 100, subtasks: [], comments: [], createdAt: new Date('2025-10-05') },
  { id: '6', projectId: '2', title: 'Selecção de mobiliário', description: 'Definir peças de mobiliário para todos os ambientes', responsible: 'João Silva', deadline: new Date('2026-01-20'), status: 'doing', priority: 'medium', phase: 'acabamento', completionPercentage: 40, subtasks: [], comments: [], createdAt: new Date('2025-11-20') },
  { id: '7', projectId: '2', title: 'Instalação decorativa', description: 'Coordenar instalação de elementos decorativos', responsible: 'Pedro Costa', deadline: new Date('2026-02-10'), status: 'todo', priority: 'low', phase: 'acabamento', completionPercentage: 0, subtasks: [], comments: [], createdAt: new Date('2025-12-01') },
];

const initialDeals: Deal[] = [
  { id: '1', title: 'Projecto Escritórios Kinaxixi', clientId: '2', value: 35000000, stage: 'lead', probability: 10, expectedCloseDate: new Date('2026-03-15'), notes: 'Contacto inicial via website', createdAt: new Date('2026-01-10') },
  { id: '2', title: 'Renovação Moradia Maianga', clientId: '5', value: 18000000, stage: 'qualification', probability: 25, expectedCloseDate: new Date('2026-02-28'), notes: 'Reunião agendada para próxima semana', createdAt: new Date('2026-01-05') },
  { id: '3', title: 'Centro Comercial Cacuaco', clientId: '2', value: 150000000, stage: 'proposal', probability: 50, expectedCloseDate: new Date('2026-06-01'), notes: 'Proposta enviada, aguardando feedback', createdAt: new Date('2025-12-20') },
  { id: '4', title: 'Condomínio Residencial Talatona', clientId: '1', value: 280000000, stage: 'negotiation', probability: 75, expectedCloseDate: new Date('2026-04-15'), notes: 'Em negociação de valores finais', createdAt: new Date('2025-11-15') },
  { id: '5', title: 'Edifício Comercial Maculusso', clientId: '3', value: 45000000, stage: 'won', probability: 100, expectedCloseDate: new Date('2026-01-20'), notes: 'Contrato assinado!', createdAt: new Date('2025-10-01') },
  { id: '6', title: 'Armazém Industrial Viana', clientId: '4', value: 25000000, stage: 'lost', probability: 0, expectedCloseDate: null, notes: 'Cliente optou por outro fornecedor', createdAt: new Date('2025-09-15') },
];

interface AppContextType {
  // Data
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
  tasks: Task[];
  deals: Deal[];
  calendarEvents: CalendarEvent[];
  
  // Client operations
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Project operations
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'history'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getSubprojects: (projectId: string) => Project[];
  
  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getProjectTasks: (projectId: string) => Task[];
  
  // Deal operations
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  moveDealToStage: (dealId: string, newStage: DealStage) => void;
  getClientDeals: (clientId: string) => Deal[];
  getDealsByStage: (stage: DealStage) => Deal[];
  getPipelineMetrics: () => { totalValue: number; weightedValue: number; dealsByStage: Record<DealStage, number>; stageValues: Record<DealStage, number> };
  
  // Calendar operations
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
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
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: '1', title: 'Reunião com Tech Solutions', description: 'Discutir andamento do projecto Talatona', type: 'meeting', startDate: new Date('2026-01-27T10:00:00'), endDate: new Date('2026-01-27T11:30:00'), allDay: false, clientId: '1', dealId: '4', reminder: 30, completed: false, createdAt: new Date() },
    { id: '2', title: 'Chamada de acompanhamento - Fintech', description: 'Follow-up da proposta enviada', type: 'call', startDate: new Date('2026-01-25T14:00:00'), endDate: new Date('2026-01-25T14:30:00'), allDay: false, clientId: '5', dealId: '2', reminder: 15, completed: false, createdAt: new Date() },
    { id: '3', title: 'Deadline Proposta Centro Comercial', description: 'Prazo para envio da proposta final', type: 'deadline', startDate: new Date('2026-01-28T00:00:00'), endDate: new Date('2026-01-28T23:59:00'), allDay: true, clientId: '2', dealId: '3', reminder: 1440, completed: false, createdAt: new Date() },
    { id: '4', title: 'Visita ao terreno Viana', description: 'Visita técnica para levantamento', type: 'follow_up', startDate: new Date('2026-01-29T09:00:00'), endDate: new Date('2026-01-29T12:00:00'), allDay: false, clientId: '3', dealId: null, reminder: 60, completed: false, createdAt: new Date() },
    { id: '5', title: 'Apresentação Projecto Miramar', description: 'Apresentação do design de interiores ao cliente', type: 'meeting', startDate: new Date('2026-01-30T15:00:00'), endDate: new Date('2026-01-30T17:00:00'), allDay: false, clientId: '3', dealId: null, reminder: 60, completed: false, createdAt: new Date() },
  ]);

  // Client operations
  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setClients(prev => [...prev, newClient]);
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  // Project operations
  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'history'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      history: [{ id: crypto.randomUUID(), action: 'Criação', description: 'Projecto criado', date: new Date() }],
    };
    setProjects(prev => [...prev, newProject]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const newHistory = [...p.history];
        if (updates.status && updates.status !== p.status) {
          newHistory.push({
            id: crypto.randomUUID(),
            action: 'Alteração de estado',
            description: `De ${p.status} para ${updates.status}`,
            date: new Date(),
          });
        }
        return { ...p, ...updates, history: newHistory };
      }
      return p;
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id && p.parentProjectId !== id));
  }, []);

  const getSubprojects = useCallback((projectId: string) => {
    return projects.filter(p => p.parentProjectId === projectId);
  }, [projects]);

  // Transaction operations
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Task operations
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const getProjectTasks = useCallback((projectId: string) => {
    return tasks.filter(t => t.projectId === projectId);
  }, [tasks]);

  // Deal operations
  const addDeal = useCallback((deal: Omit<Deal, 'id' | 'createdAt'>) => {
    const newDeal: Deal = {
      ...deal,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setDeals(prev => [...prev, newDeal]);
  }, []);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  }, []);

  const moveDealToStage = useCallback((dealId: string, newStage: DealStage) => {
    const stageConfig = dealStageConfig.find(s => s.id === newStage);
    setDeals(prev => prev.map(d => 
      d.id === dealId 
        ? { ...d, stage: newStage, probability: stageConfig?.probability || d.probability }
        : d
    ));
  }, []);

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

  // Calendar operations
  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  }, []);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  }, []);

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

    // Calculate monthly flow for last 6 months
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
    addClient,
    updateClient,
    deleteClient,
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
    clients, projects, transactions, tasks, deals, calendarEvents,
    addClient, updateClient, deleteClient,
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
