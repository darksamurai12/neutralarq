// Client Types
export type ClientStatus = 'lead' | 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  createdAt: Date;
}

// Task Types
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  responsible: string;
  deadline: Date | null;
  status: TaskStatus;
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
