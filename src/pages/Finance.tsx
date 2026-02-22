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

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 84%, 60%)'];

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

  const cashflowExpenses = cashflowTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
  const cashflowTotal = cashflowExpenses;

  const areaChartData = dashboardMetrics.monthlyFlow.map(item => ({
    ...item,
    balance: item.income - item.expenses,
  }));

  const projectExpenses = projects.map(project => {
    const projectTx = transactions.filter(t => t.projectId === project.id);
    const total = projectTx.reduce((sum, t) => sum + (t.type === 'expense' ? t.value : 0), 0);
    return { name: project.name, value: total };
  }).filter(p => p.value > 0).slice(0, 5);

  const renderTransactionRow = (transaction: Transaction, index: number) => {
    const project = projects.find((p) => p.id === transaction.projectId);
    const CategoryIcon = transaction.category ? categoryIcons[transaction.category] : null;
    
    return (
      <div
        key={transaction.id}
        className="flex items-center justify-between p-3 md:p-4 hover:bg-muted/30 transition-all duration-200 group"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
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
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate max-w-[140px] xs:max-w-[200px] md:max-w-none">{transaction.description}</p>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(transaction.date), "dd MMM yyyy", { locale: pt })}</span>
              </div>
              {transaction.destination === 'cashflow' && transaction.category && (
                <Badge variant="secondary" className="text-[9px] md:text-xs py-0 gap-1">
                  {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                  {categoryLabels[transaction.category]}
                </Badge>
              )}
              {project && (
                <Badge variant="secondary" className="text-[9px] md:text-xs py-0">
                  {project.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className={cn(
            'font-bold text-sm md:text-lg tabular-nums',
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
            <Button className="w-full md:w-auto gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Entradas</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-rose transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Saídas</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Saldo Actual</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(balance)}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Fluxo de Caixa</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{formatCurrency(cashflowTotal)}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full md:w-auto">
          <TabsTrigger value="geral" className="flex-1 md:flex-none rounded-lg gap-2 data-[state=active]:shadow-sm">
            <Receipt className="w-4 h-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex-1 md:flex-none rounded-lg gap-2 data-[state=active]:shadow-sm">
            <Banknote className="w-4 h-4" />
            Caixa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-card border-border/50 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-pastel-mint flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  Evolução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] md:h-[300px]">
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
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
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
                  Projectos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={projectExpenses} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                        {projectExpenses.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="border-b border-border/50 px-4 md:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold">Transações</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <SearchFilter value={searchQuery} onChange={setSearchQuery} placeholder="Pesquisar..." />
                  <StatusFilter<TransactionType> value={typeFilter} onChange={(v) => setTypeFilter(v)} options={typeOptions} placeholder="Tipo" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {sortedTransactions.map((t, i) => renderTransactionRow(t, i))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Fluxo de Caixa</h3>
              <p className="text-sm text-muted-foreground">Gestão de despesas variáveis</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 md:flex-none gap-2"
                onClick={() => {
                  setFormData({ ...formData, type: 'income', destination: 'cashflow' });
                  setIsDialogOpen(true);
                }}
              >
                <ArrowUpRight className="w-4 h-4" />
                Entrada
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 md:flex-none gap-2"
                onClick={() => {
                  setFormData({ ...formData, type: 'expense', destination: 'cashflow' });
                  setIsDialogOpen(true);
                }}
              >
                <ArrowDownRight className="w-4 h-4" />
                Saída
              </Button>
            </div>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {sortedTransactions.map((t, i) => renderTransactionRow(t, i))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}