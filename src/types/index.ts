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

// Deal/Pipeline Types
export type DealStage = 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface DealStageConfig {
  id: DealStage;
  label: string;
  probability: number; // 0-100
  color: string;
}

export interface Deal {
  id: string;
  title: string;
  clientId: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: Date | null;
  notes: string;
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

// Calendar Event Types
export type CalendarEventType = 'meeting' | 'call' | 'follow_up' | 'deadline' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: CalendarEventType;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  clientId: string | null;
  dealId: string | null;
  reminder: number | null; // minutes before event
  completed: boolean;
  createdAt: Date;
}

export type CalendarView = 'day' | 'week' | 'month';

// Alert Types
export type AlertType = 'event_reminder' | 'task_overdue' | 'task_due_soon' | 'deal_inactive' | 'project_paused' | 'budget_warning';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  entityId: string | null;
  entityType: 'event' | 'task' | 'deal' | 'project' | null;
  createdAt: Date;
  read: boolean;
  dismissed: boolean;
}

// Pricing Types
export interface PricingProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  marginPercent: number;
  finalPrice: number;
  createdAt: Date;
}

export interface PricingLabor {
  id: string;
  name: string;
  description: string;
  providerValue: number;
  marginPercent: number;
  finalPrice: number;
  createdAt: Date;
}

export interface PricingTransport {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  marginPercent: number;
  finalPrice: number;
  createdAt: Date;
}

// Budget Types
export interface BudgetItem {
  id: string;
  type: 'product' | 'labor' | 'transport';
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCost: number;
  totalCost: number;
  profit: number;
}

export interface Budget {
  id: string;
  name: string;
  clientId: string | null;
  projectId: string | null;
  items: BudgetItem[];
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  marginPercent: number;
  createdAt: Date;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}
