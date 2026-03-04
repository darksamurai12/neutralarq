export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed';
export type ProjectType = 'architecture' | 'construction' | 'interior_design';
export type ProjectPhase = 'projeto' | 'obra' | 'acabamento' | 'entrega';

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
  parentProjectId?: string | null;
  createdAt: Date;
}

export interface ProjectHistory {
  id: string;
  projectId: string;
  action: string;
  description: string;
  date: Date;
}

export type ClientStatus = 'lead' | 'active' | 'inactive';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phone2?: string;
  company: string;
  position?: string;
  address?: string;
  notes?: string;
  status: ClientStatus;
  createdAt: Date;
}

export type TaskType = 'internal' | 'personal';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'canceled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  responsible: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: Date;
  deadline: Date;
  completionPercentage: number;
  subtasks: any[];
  comments: any[];
  attachments?: any[];
  notes?: string;
  createdAt: Date;
  projectId?: string | null;
}

export type TransactionType = 'income' | 'expense';
export type TransactionDestination = 'project' | 'cashflow';
export type ExpenseCategory = 'alimentacao' | 'transporte' | 'material' | 'servicos' | 'equipamento' | 'comunicacao' | 'renda' | 'outros';

export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: TransactionType;
  destination: TransactionDestination;
  category?: ExpenseCategory | null;
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
  history: ProjectHistory[];
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

export interface DealStageConfig {
  id: DealStage;
  label: string;
  probability: number;
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

export type InteractionType = 'call' | 'meeting' | 'email' | 'whatsapp' | 'note';

export interface ClientInteraction {
  id: string;
  clientId: string;
  type: InteractionType;
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
  clientName: string | null;
  projectId: string | null;
  items: BudgetItem[];
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  marginPercent: number;
  notes?: string;
  createdAt: Date;
}

export type NoteColor = 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'rose';
export type NoteType = 'text' | 'checklist' | 'office' | 'procedure' | 'meeting' | 'idea' | 'reminder' | 'personal';
export type NotePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NoteList {
  id: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
}

export interface NoteChecklistItem {
  id: string;
  noteId: string;
  description: string;
  isCompleted: boolean;
  orderIndex: number;
}

export interface Note {
  id: string;
  userId: string;
  listId: string | null;
  title: string;
  content: string;
  type: NoteType;
  priority: NotePriority;
  color: NoteColor;
  category?: string;
  isPinned: boolean;
  isImportant: boolean;
  isArchived: boolean;
  reminderDate: Date | null;
  authorName?: string;
  checklistItems?: NoteChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  date: Date;
}

export type DocumentCategory = 'administrativo' | 'financeiro' | 'rh' | 'contratos' | 'projetos' | 'templates' | 'outros';
export type DocumentStatus = 'active' | 'archived' | 'expired' | 'deleted';

export interface Document {
  id: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  department?: string;
  filePath: string;
  size: number;
  fileType: string;
  version: number;
  status: DocumentStatus;
  expiryDate?: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AlertType = 'event_reminder' | 'task_overdue' | 'task_due_soon' | 'deal_inactive' | 'project_paused' | 'budget_warning';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  entityId?: string;
  entityType?: 'event' | 'task' | 'deal' | 'project' | 'budget';
  createdAt: Date;
  read: boolean;
  dismissed: boolean;
}