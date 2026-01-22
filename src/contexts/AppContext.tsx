import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Client, Project, Transaction, Task, ProjectWithDetails, DashboardMetrics, MonthlyFlow, TaskStatus } from '@/types';
import { format, subMonths, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Initial mock data
const initialClients: Client[] = [
  { id: '1', name: 'Tech Solutions Ltda', email: 'contato@techsolutions.com', phone: '+244 923 456 789', company: 'Tech Solutions', position: 'CEO', address: 'Rua da Inovação, 123, Luanda', notes: 'Cliente premium desde 2024', status: 'active', createdAt: new Date('2025-09-15') },
  { id: '2', name: 'Carlos Startup', email: 'ola@startupdigital.io', phone: '+244 912 345 678', company: 'Startup Digital', position: 'Fundador', address: 'Av. Marginal, 456, Luanda', notes: 'Interessado em app mobile', status: 'lead', createdAt: new Date('2025-10-20') },
  { id: '3', name: 'Maria Express', email: 'vendas@comercioexpress.com.br', phone: '+244 934 567 890', company: 'Comércio Express', position: 'Directora Comercial', address: 'Bairro Maculusso, Luanda', notes: 'Projecto e-commerce em andamento', status: 'active', createdAt: new Date('2025-11-10') },
  { id: '4', name: 'João Criativo', email: 'projetos@agenciacriativa.com', phone: '+244 945 678 901', company: 'Agência Criativa', position: 'Director Criativo', address: 'Talatona, Luanda Sul', notes: 'Projecto anterior concluído com sucesso', status: 'inactive', createdAt: new Date('2025-07-05') },
  { id: '5', name: 'Ana Fintech', email: 'dev@fintechbrasil.com', phone: '+244 956 789 012', company: 'Fintech Angola', position: 'CTO', address: 'Ilha de Luanda', notes: 'Novo lead via referência', status: 'lead', createdAt: new Date('2025-12-01') },
];

const initialProjects: Project[] = [
  { id: '1', name: 'Sistema de Gestão ERP', clientId: '1', deadline: new Date('2026-03-30'), budget: 4500000, status: 'in_progress', createdAt: new Date('2025-09-20') },
  { id: '2', name: 'App Mobile E-commerce', clientId: '3', deadline: new Date('2026-02-15'), budget: 2800000, status: 'in_progress', createdAt: new Date('2025-10-01') },
  { id: '3', name: 'Website Institucional', clientId: '1', deadline: new Date('2025-12-30'), budget: 850000, status: 'completed', createdAt: new Date('2025-10-15') },
  { id: '4', name: 'Dashboard Analytics', clientId: '3', deadline: new Date('2026-04-20'), budget: 3200000, status: 'planning', createdAt: new Date('2025-12-10') },
];

const initialTransactions: Transaction[] = [
  { id: '1', description: 'Entrada - Sistema ERP (Parcela 1)', value: 1500000, type: 'income', projectId: '1', clientId: '1', date: new Date('2025-09-25'), createdAt: new Date('2025-09-25') },
  { id: '2', description: 'Servidor Cloud AWS', value: 45000, type: 'expense', projectId: '1', clientId: '1', date: new Date('2025-10-01'), createdAt: new Date('2025-10-01') },
  { id: '3', description: 'Entrada - App Mobile (Sinal)', value: 840000, type: 'income', projectId: '2', clientId: '3', date: new Date('2025-10-05'), createdAt: new Date('2025-10-05') },
  { id: '4', description: 'Licença Software Design', value: 29900, type: 'expense', projectId: '2', clientId: '3', date: new Date('2025-10-10'), createdAt: new Date('2025-10-10') },
  { id: '5', description: 'Entrada - Website (Total)', value: 850000, type: 'income', projectId: '3', clientId: '1', date: new Date('2025-11-20'), createdAt: new Date('2025-11-20') },
  { id: '6', description: 'Hospedagem Anual', value: 18000, type: 'expense', projectId: '3', clientId: '1', date: new Date('2025-11-22'), createdAt: new Date('2025-11-22') },
  { id: '7', description: 'Entrada - Sistema ERP (Parcela 2)', value: 1500000, type: 'income', projectId: '1', clientId: '1', date: new Date('2025-12-01'), createdAt: new Date('2025-12-01') },
  { id: '8', description: 'Freelancer Backend', value: 350000, type: 'expense', projectId: '1', clientId: '1', date: new Date('2025-12-15'), createdAt: new Date('2025-12-15') },
  { id: '9', description: 'Entrada - App Mobile (Parcela 2)', value: 980000, type: 'income', projectId: '2', clientId: '3', date: new Date('2026-01-10'), createdAt: new Date('2026-01-10') },
  { id: '10', description: 'API Gateway', value: 12000, type: 'expense', projectId: '2', clientId: '3', date: new Date('2026-01-15'), createdAt: new Date('2026-01-15') },
];

const initialTasks: Task[] = [
  { id: '1', projectId: '1', title: 'Análise de requisitos', description: 'Levantar todos os requisitos com o cliente', responsible: 'João Silva', deadline: new Date('2025-10-01'), status: 'done', subtasks: [{ id: 's1', title: 'Reunião inicial', completed: true }, { id: 's2', title: 'Documentação', completed: true }], comments: [], createdAt: new Date('2025-09-20') },
  { id: '2', projectId: '1', title: 'Desenvolver módulo de vendas', description: 'Implementar CRUD de vendas', responsible: 'Maria Santos', deadline: new Date('2026-01-15'), status: 'doing', subtasks: [{ id: 's3', title: 'API de vendas', completed: true }, { id: 's4', title: 'Interface', completed: false }], comments: [], createdAt: new Date('2025-10-01') },
  { id: '3', projectId: '1', title: 'Integração com API bancária', description: 'Integrar com Multicaixa Express', responsible: 'Pedro Costa', deadline: new Date('2026-02-01'), status: 'todo', subtasks: [], comments: [], createdAt: new Date('2025-11-01') },
  { id: '4', projectId: '2', title: 'Design do app', description: 'Criar protótipos no Figma', responsible: 'Ana Lima', deadline: new Date('2025-11-15'), status: 'done', subtasks: [], comments: [], createdAt: new Date('2025-10-05') },
  { id: '5', projectId: '2', title: 'Implementar carrinho', description: 'Funcionalidade de carrinho de compras', responsible: 'João Silva', deadline: new Date('2026-01-20'), status: 'doing', subtasks: [], comments: [], createdAt: new Date('2025-11-20') },
  { id: '6', projectId: '2', title: 'Testes de integração', description: 'Testes end-to-end', responsible: 'Pedro Costa', deadline: new Date('2026-02-10'), status: 'todo', subtasks: [], comments: [], createdAt: new Date('2025-12-01') },
];

interface AppContextType {
  // Data
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
  tasks: Task[];
  
  // Client operations
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Project operations
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getProjectTasks: (projectId: string) => Task[];
  
  // Computed data
  getProjectWithDetails: (projectId: string) => ProjectWithDetails | undefined;
  getClientProjects: (clientId: string) => Project[];
  getProjectTransactions: (projectId: string) => Transaction[];
  getDashboardMetrics: () => DashboardMetrics;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

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
  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setProjects(prev => [...prev, newProject]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

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

  // Computed data
  const getProjectTransactions = useCallback((projectId: string) => {
    return transactions.filter(t => t.projectId === projectId);
  }, [transactions]);

  const getClientProjects = useCallback((clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  }, [projects]);

  const getProjectWithDetails = useCallback((projectId: string): ProjectWithDetails | undefined => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const client = clients.find(c => c.id === project.clientId);
    const projectTransactions = getProjectTransactions(projectId);
    const projectTasks = getProjectTasks(projectId);
    const totalIncome = projectTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = projectTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);

    return {
      ...project,
      client,
      transactions: projectTransactions,
      tasks: projectTasks,
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
    };
  }, [projects, clients, getProjectTransactions, getProjectTasks]);

  const getDashboardMetrics = useCallback((): DashboardMetrics => {
    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
    const currentBalance = totalRevenue - totalExpenses;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const leadsInFunnel = clients.filter(c => c.status === 'lead').length;

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
      leadsInFunnel,
      monthlyFlow,
    };
  }, [transactions, projects, clients]);

  const value = useMemo(() => ({
    clients,
    projects,
    transactions,
    tasks,
    addClient,
    updateClient,
    deleteClient,
    addProject,
    updateProject,
    deleteProject,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addTask,
    updateTask,
    deleteTask,
    getProjectTasks,
    getProjectWithDetails,
    getClientProjects,
    getProjectTransactions,
    getDashboardMetrics,
  }), [
    clients, projects, transactions, tasks,
    addClient, updateClient, deleteClient,
    addProject, updateProject, deleteProject,
    addTransaction, updateTransaction, deleteTransaction,
    addTask, updateTask, deleteTask, getProjectTasks,
    getProjectWithDetails, getClientProjects, getProjectTransactions, getDashboardMetrics,
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
