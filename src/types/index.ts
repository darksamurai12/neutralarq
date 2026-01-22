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
export type TaskStatus = 'todo' | 'doing' | 'done';

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
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: Date;
}

// Project Types
export type ProjectStatus = 'planning' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  deadline: Date;
  budget: number;
  status: ProjectStatus;
  createdAt: Date;
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
export interface ProjectWithDetails extends Project {
  client: Client | undefined;
  transactions: Transaction[];
  tasks: Task[];
  totalIncome: number;
  totalExpenses: number;
  profit: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  currentBalance: number;
  activeProjects: number;
  leadsInFunnel: number;
  monthlyFlow: MonthlyFlow[];
}

export interface MonthlyFlow {
  month: string;
  income: number;
  expenses: number;
}
