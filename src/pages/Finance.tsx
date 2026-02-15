import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Receipt,
  PiggyBank,
  CreditCard,
  UtensilsCrossed,
  Car,
  Package,
  Wrench,
  Monitor,
  Phone,
  Home,
  HelpCircle,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction, TransactionType, TransactionDestination, ExpenseCategory } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { StatusFilter } from '@/components/filters/StatusFilter';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const typeOptions = [
  { value: 'income' as const, label: 'Entradas' },
  { value: 'expense' as const, label: 'Saídas' },
];

const categoryLabels: Record<ExpenseCategory, string> = {
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  material: 'Material',
  servicos: 'Serviços',
  equipamento: 'Equipamento',
  comunicacao: 'Comunicação',
  renda: 'Renda',
  outros: 'Outros',
};

const categoryIcons: Record<ExpenseCategory, React.ElementType> = {
  alimentacao: UtensilsCrossed,
  transporte: Car,
  material: Package,
  servicos: Wrench,
  equipamento: Monitor,
  comunicacao: Phone,
  renda: Home,
  outros: HelpCircle,
};

const categoryColors: Record<ExpenseCategory, string> = {
  alimentacao: 'hsl(38, 92%, 50%)',
  transporte: 'hsl(217, 91%, 60%)',
  material: 'hsl(142, 76%, 36%)',
  servicos: 'hsl(280, 84%, 60%)',
  equipamento: 'hsl(0, 84%, 60%)',
  comunicacao: 'hsl(190, 80%, 45%)',
  renda: 'hsl(340, 65%, 60%)',
  outros: 'hsl(220, 10%, 50%)',
};

export default function Finance() {
  const { transactions, projects, clients, addTransaction, updateTransaction, deleteTransaction, getDashboardMetrics } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    type: 'income' as TransactionType,
    destination: 'project' as TransactionDestination,
    category: '' as string,
    projectId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('geral');
  
  const dashboardMetrics = getDashboardMetrics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find((p) => p.id === formData.projectId);
    const destination = formData.destination;
    
    const transactionData = {
      description: formData.description,
      value: parseFloat(formData.value),
      type: formData.type,
      destination,
      category: (formData.type === 'expense' && formData.category ? formData.category : null) as ExpenseCategory | null,
      projectId: destination === 'project' ? (formData.projectId || null) : null,
      clientId: destination === 'project' ? (project?.clientId || null) : null,
      date: new Date(formData.date),
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      value: '',
      type: 'income',
      destination: 'project',
      category: '',
      projectId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setEditingTransaction(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      value: transaction.value.toString(),
      type: transaction.type,
      destination: transaction.destination || 'project',
      category: transaction.category || '',
      projectId: transaction.projectId || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
  };

  // Transactions filtered by tab
  const projectTransactions = transactions.filter(t => t.destination !== 'cashflow');
  const cashflowTransactions = transactions.filter(t => t.destination === 'cashflow');

  const currentTransactions = activeTab === 'geral' ? projectTransactions : cashflowTransactions;

  const filteredTransactions = currentTransactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0';

  // Cash flow totals
  const cashflowIncome = cashflowTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
  const cashflowExpenses = cashflowTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
  const cashflowBalance = cashflowIncome - cashflowExpenses;
  const cashflowTotal = cashflowExpenses;

  // Cash flow by category
  const cashflowByCategory = Object.entries(categoryLabels).map(([key, label]) => {
    const total = cashflowTransactions
      .filter(t => t.category === key)
      .reduce((sum, t) => sum + t.value, 0);
    return { category: key as ExpenseCategory, label, value: total };
  }).filter(c => c.value > 0);

  // Area chart data
  const areaChartData = dashboardMetrics.monthlyFlow.map(item => ({
    ...item,
    balance: item.income - item.expenses,
  }));

  // Project expenses for pie chart
  const projectExpenses = projects.map(project => {
    const projectTx = transactions.filter(t => t.projectId === project.id);
    const total = projectTx.reduce((sum, t) => sum + (t.type === 'expense' ? t.value : 0), 0);
    return { name: project.name, value: total };
  }).filter(p => p.value > 0).slice(0, 5);

  const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 84%, 60%)'];

  const renderTransactionRow = (transaction: Transaction, index: number) => {
    const project = projects.find((p) => p.id === transaction.projectId);
    const client = clients.find((c) => c.id === transaction.clientId);
    const CategoryIcon = transaction.category ? categoryIcons[transaction.category] : null;
    
    return (
      <div
        key={transaction.id}
        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all duration-200 group"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
            transaction.type === 'income' 
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20' 
              : 'bg-gradient-to-br from-rose-500/20 to-rose-600/20'
          )}>
            {transaction.type === 'income' ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-rose-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{transaction.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(transaction.date), "dd MMM yyyy", { locale: pt })}</span>
              </div>
              {transaction.destination === 'cashflow' && transaction.category && (
                <Badge variant="secondary" className="text-xs py-0 gap-1">
                  {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                  {categoryLabels[transaction.category]}
                </Badge>
              )}
              {project && (
                <Badge variant="secondary" className="text-xs py-0">
                  {project.name}
                </Badge>
              )}
              {client && (
                <Badge variant="outline" className="text-xs py-0">
                  {client.name}
                </Badge>
              )}
              {transaction.destination === 'cashflow' && (
                <Badge variant="outline" className="text-xs py-0 border-amber-300 text-amber-600">
                  <Banknote className="w-3 h-3 mr-1" />
                  Fluxo de Caixa
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={cn(
            'font-bold text-lg tabular-nums',
            transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
          )}>
            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.value)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteTransaction(transaction.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Finanças"
        description="Gestão completa do fluxo de caixa"
        icon={Wallet}
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Pagamento parcela 1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (AOA)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: TransactionType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>Entrada</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="expense">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-destructive" />
                        <span>Saída</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destination selector */}
              <div className="space-y-2">
                <Label>{formData.type === 'income' ? 'Destino da Entrada' : 'Destino da Saída'}</Label>
                <Select
                  value={formData.destination}
                  onValueChange={(value: TransactionDestination) => setFormData({ ...formData, destination: value, projectId: value === 'cashflow' ? '' : formData.projectId })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-primary" />
                        <span>Projecto</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cashflow">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-amber-500" />
                        <span>{formData.type === 'income' ? 'Transferir para Fluxo de Caixa' : 'Saída do Fluxo de Caixa'}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category selector - for expenses */}
              {formData.type === 'expense' && (
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category || "none"}
                    onValueChange={(value) => setFormData({ ...formData, category: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem categoria</SelectItem>
                      {Object.entries(categoryLabels).map(([key, label]) => {
                        const Icon = categoryIcons[key as ExpenseCategory];
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Project selector - only when destination is project */}
              {(formData.type === 'income' || formData.destination === 'project') && (
                <div className="space-y-2">
                  <Label htmlFor="project">Vincular a Projeto (opcional)</Label>
                  <Select
                    value={formData.projectId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem vínculo</SelectItem>
                      {projects.map((project) => {
                        const client = clients.find((c) => c.id === project.clientId);
                        return (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} ({client?.name})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">{editingTransaction ? 'Guardar' : 'Adicionar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Entradas</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(totalIncome)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <ArrowUpRight className="w-3 h-3" />
            <span>+12.5% este mês</span>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-rose transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Saídas</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(totalExpenses)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <ArrowDownRight className="w-3 h-3" />
            <span>-8.2% este mês</span>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Saldo Actual</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(balance)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <PiggyBank className="w-3 h-3" />
            <span>{savingsRate}% taxa poupança</span>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Fluxo de Caixa</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(cashflowTotal)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <CreditCard className="w-3 h-3" />
            <span>{cashflowTransactions.length} despesas variáveis</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="geral" className="rounded-lg gap-2 data-[state=active]:shadow-sm">
            <Receipt className="w-4 h-4" />
            Geral & Projectos
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="rounded-lg gap-2 data-[state=active]:shadow-sm">
            <Banknote className="w-4 h-4" />
            Fluxo de Caixa
          </TabsTrigger>
        </TabsList>

        {/* GERAL TAB */}
        <TabsContent value="geral" className="space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-card border-border/50 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-pastel-mint flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  Evolução do Fluxo de Caixa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                        formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Entradas' : 'Saídas']}
                      />
                      <Area type="monotone" dataKey="income" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="expenses" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-primary" />
                  </div>
                  Despesas por Projecto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectExpenses.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={projectExpenses} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                          {projectExpenses.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                        <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem despesas associadas a projectos
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-primary" />
                  </div>
                  Transações de Projectos
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-64">
                    <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Pesquisar transações..." />
                  </div>
                  <StatusFilter<TransactionType> value={typeFilter} onChange={(v) => setTypeFilter(v)} options={typeOptions} placeholder="Tipo" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {sortedTransactions.map((t, i) => renderTransactionRow(t, i))}
                {sortedTransactions.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Receipt className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Nenhuma transação encontrada</p>
                    <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros ou adicione uma nova transação</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CASH FLOW TAB */}
        <TabsContent value="cashflow" className="space-y-6">
          {/* Quick action + balance */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Gestão do Fluxo de Caixa</h3>
              <p className="text-sm text-muted-foreground">Transfira valores e registe saídas a partir do saldo disponível</p>
            </div>
            <div className="flex gap-3">
              <Button
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  setFormData({
                    description: '',
                    value: '',
                    type: 'income',
                    destination: 'cashflow',
                    category: '',
                    projectId: '',
                    date: format(new Date(), 'yyyy-MM-dd'),
                  });
                  setEditingTransaction(null);
                  setIsDialogOpen(true);
                }}
              >
                <ArrowUpRight className="w-4 h-4" />
                Transferir para Caixa
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setFormData({
                    description: '',
                    value: '',
                    type: 'expense',
                    destination: 'cashflow',
                    category: '',
                    projectId: '',
                    date: format(new Date(), 'yyyy-MM-dd'),
                  });
                  setEditingTransaction(null);
                  setIsDialogOpen(true);
                }}
              >
                <ArrowDownRight className="w-4 h-4" />
                Registar Saída
              </Button>
            </div>
          </div>

          {/* Cash flow balance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Transferido</p>
              <p className="text-xl font-bold text-emerald-600 tracking-tight">{formatCurrency(cashflowIncome)}</p>
            </div>
            <div className="rounded-2xl p-5 bg-pastel-rose transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Saídas</p>
              <p className="text-xl font-bold text-rose-600 tracking-tight">{formatCurrency(cashflowExpenses)}</p>
            </div>
            <div className={cn(
              "rounded-2xl p-5 transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5",
              cashflowBalance >= 0 ? 'bg-pastel-sky' : 'bg-destructive/10'
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  cashflowBalance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
                )}>
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Saldo Disponível</p>
              <p className={cn(
                "text-xl font-bold tracking-tight",
                cashflowBalance >= 0 ? 'text-blue-600' : 'text-destructive'
              )}>
                {formatCurrency(cashflowBalance)}
              </p>
            </div>
            <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Nº de Transações</p>
              <p className="text-xl font-bold text-foreground tracking-tight">{cashflowTransactions.length}</p>
            </div>
          </div>

          {/* Category breakdown chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-card border-border/50 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-pastel-lavender flex items-center justify-center">
                    <Banknote className="w-4 h-4 text-primary" />
                  </div>
                  Despesas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cashflowByCategory.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashflowByCategory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
                        <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={100} />
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), 'Total']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {cashflowByCategory.map((entry) => (
                            <Cell key={entry.category} fill={categoryColors[entry.category]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem despesas no fluxo de caixa
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category summary cards */}
            <Card className="shadow-lg border-0 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-amber-600" />
                  </div>
                  Resumo por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cashflowByCategory.length > 0 ? cashflowByCategory.map(({ category, label, value }) => {
                    const Icon = categoryIcons[category];
                    const percentage = cashflowTotal > 0 ? ((value / cashflowTotal) * 100).toFixed(0) : '0';
                    return (
                      <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categoryColors[category]}20` }}>
                            <Icon className="w-4 h-4" style={{ color: categoryColors[category] }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{percentage}% do total</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(value)}</span>
                      </div>
                    );
                  }) : (
                    <div className="py-8 text-center text-muted-foreground text-sm">
                      Sem categorias registadas
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Transactions List */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Banknote className="w-4 h-4 text-amber-600" />
                  </div>
                  Despesas Variáveis
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-64">
                    <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Pesquisar despesas..." />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {sortedTransactions.map((t, i) => renderTransactionRow(t, i))}
                {sortedTransactions.length === 0 && (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Banknote className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Nenhuma despesa variável encontrada</p>
                    <p className="text-sm text-muted-foreground mt-1">Adicione uma nova transação com destino "Fluxo de Caixa"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
