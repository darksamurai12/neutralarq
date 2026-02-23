export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed';
export type ProjectType = 'architecture' | 'construction' | 'interior_design';

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: ProjectType;
  location: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  deadline: Date;
  budget: number;
  imageUrl?: string;
  parentProjectId?: string | null;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  position?: string;
  address?: string;
  notes?: string;
  status: 'lead' | 'active' | 'inactive';
  createdAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  responsible?: string;
  deadline: Date | null;
  status: 'todo' | 'doing' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  phase: 'projeto' | 'obra' | 'acabamento' | 'entrega';
  completionPercentage: number;
  subtasks: any[];
  comments: any[];
  createdAt: Date;
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'income' | 'expense';
  destination: 'project' | 'cashflow';
  category?: string | null;
  projectId?: string | null;
  clientId?: string | null;
  date: Date;
  createdAt: Date;
}

export interface ProjectKPIs {
  progressPercentage: number;
  tasksByStatus: {
    todo: number;
    doing: number;
    review: number;
    done: number;
  };
  overdueTasks: number;
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  budgetUsed: number;
  budgetRemaining: number;
  budgetPercentage: number;
  deadlineDeviation: number;
}

export interface ProjectWithDetails extends Project {
  client: Client | null;
  tasks: Task[];
  transactions: Transaction[];
  history: any[];
  kpis: ProjectKPIs;
}

export interface DashboardMetrics {
  activeClients: number;
  activeProjects: number;
  completedProjects: number;
  currentBalance: number;
  totalRevenue: number;
  leadsInFunnel: number;
  projectsByStatus: Record<ProjectStatus, number>;
  monthlyFlow: MonthlyFlow[];
  recentProjects: Project[];
}

export interface MonthlyFlow {
  month: string;
  income: number;
  expenses: number;
}

export type CalendarEventType = 'meeting' | 'call' | 'follow_up' | 'deadline' | 'other';
export type CalendarView = 'day' | 'week' | 'month';

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
  reminder: number | null;
  completed: boolean;
  createdAt: Date;
}

export type DealStage = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';

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

export interface DealStageConfig {
  id: DealStage;
  label: string;
  probability: number;
  color: string;
}

export interface ClientInteraction {
  id: string;
  clientId: string;
  type: 'call' | 'meeting' | 'email' | 'whatsapp' | 'note';
  description: string;
  date: Date;
  createdAt: Date;
}

export type InventoryCategory = 'material' | 'ferramenta' | 'consumivel' | 'outro';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minStock: number;
  unitCost: number;
  totalValue: number;
  location: string;
  lastUpdated: Date;
  createdAt: Date;
}

export type PricingItemType = 'product' | 'labor' | 'transport';

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

export interface BudgetItem {
  id: string;
  type: PricingItemType;
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCost: number;
  totalCost: number;
  profit: number;
  marginPercent: number;
  groupName?: string;
}

export interface Budget {
  id: string;
  name: string;
  clientId: string | null;
  projectId: string | null;
  items: BudgetItem[];
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  marginPercent: number;
  createdAt: Date;
}

export type NoteColor = 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'rose';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}