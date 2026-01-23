// Client Types
export type ClientStatus = 'lead' | 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  notes: string;
  status: ClientStatus;
  createdAt: Date;
}

// Task Types
export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectPhase = 'projeto' | 'obra' | 'acabamento' | 'entrega';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  responsible: string;
  deadline: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  phase: ProjectPhase;
  completionPercentage: number;
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: Date;
}

// Project Types
export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed';
export type ProjectType = 'architecture' | 'construction' | 'interior_design';

export interface ProjectHistory {
  id: string;
  action: string;
  description: string;
  date: Date;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  type: ProjectType;
  location: string;
  description: string;
  startDate: Date;
  deadline: Date;
  budget: number;
  status: ProjectStatus;
  createdAt: Date;
  history: ProjectHistory[];
}

// Finance Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: TransactionType;
  projectId: string | null;
  clientId: string | null;
  date: Date;
  createdAt: Date;
}

// Computed Types
export interface ProjectKPIs {
  progressPercentage: number;
  tasksByStatus: Record<TaskStatus, number>;
  overdueTasks: number;
  deadlineDeviation: number; // days
  budgetUsed: number;
  budgetRemaining: number;
  budgetPercentage: number;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
}

export interface ProjectWithDetails extends Project {
  client: Client | undefined;
  transactions: Transaction[];
  tasks: Task[];
  kpis: ProjectKPIs;
}

export interface DashboardMetrics {
  totalRevenue: number;
  currentBalance: number;
  activeProjects: number;
  completedProjects: number;
  activeClients: number;
  leadsInFunnel: number;
  projectsByStatus: Record<ProjectStatus, number>;
  recentProjects: Project[];
  monthlyFlow: MonthlyFlow[];
}

export interface MonthlyFlow {
  month: string;
  income: number;
  expenses: number;
}
