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
  Filter,
  Receipt,
  PiggyBank,
  CreditCard
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
import { Transaction, TransactionType } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { StatusFilter } from '@/components/filters/StatusFilter';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
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
  Legend
} from 'recharts';

const typeOptions = [
  { value: 'income' as const, label: 'Entradas' },
  { value: 'expense' as const, label: 'Saídas' },
];

export default function Finance() {
  const { transactions, projects, clients, addTransaction, updateTransaction, deleteTransaction, getDashboardMetrics } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    type: 'income' as TransactionType,
    projectId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  
  const dashboardMetrics = getDashboardMetrics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find((p) => p.id === formData.projectId);
    
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        description: formData.description,
        value: parseFloat(formData.value),
        type: formData.type,
        projectId: formData.projectId || null,
        clientId: project?.clientId || null,
        date: new Date(formData.date),
      });
    } else {
      addTransaction({
        description: formData.description,
        value: parseFloat(formData.value),
        type: formData.type,
        projectId: formData.projectId || null,
        clientId: project?.clientId || null,
        date: new Date(formData.date),
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      value: '',
      type: 'income',
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
      projectId: transaction.projectId || '',
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
    });
    setIsDialogOpen(true);
  };

  const filteredTransactions = transactions.filter((t) => {
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

  // Calcular dados para gráfico de área
  const areaChartData = dashboardMetrics.monthlyFlow.map(item => ({
    ...item,
    balance: item.income - item.expenses,
  }));

  // Dados para gráfico de distribuição por projecto
  const projectExpenses = projects.map(project => {
    const projectTransactions = transactions.filter(t => t.projectId === project.id);
    const total = projectTransactions.reduce((sum, t) => sum + (t.type === 'expense' ? t.value : 0), 0);
    return {
      name: project.name,
      value: total,
    };
  }).filter(p => p.value > 0).slice(0, 5);

  const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(280, 84%, 60%)'];

  // Transações recentes (últimas 5)
  const recentTransactions = sortedTransactions.slice(0, 5);

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
                        <TrendingUp className="w-4 h-4 text-success" />
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

      {/* Summary Cards - Pastel Design */}
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
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Transações</p>
          <p className="text-lg font-bold text-foreground tracking-tight">{transactions.length}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Receipt className="w-3 h-3" />
            <span>{filteredTransactions.length} visíveis</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cash Flow Chart */}
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
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'income' ? 'Entradas' : 'Saídas'
                    ]}
                  />
                  <Area 
                    type="monotone"
                    dataKey="income" 
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area 
                    type="monotone"
                    dataKey="expenses" 
                    stroke="hsl(0, 84%, 60%)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution by Project */}
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
                    <Pie
                      data={projectExpenses}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {projectExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
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

      {/* Transactions Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-primary" />
              </div>
              Histórico de Transações
            </CardTitle>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-64">
                <SearchFilter
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Pesquisar transações..."
                />
              </div>
              <StatusFilter<TransactionType>
                value={typeFilter}
                onChange={(v) => setTypeFilter(v)}
                options={typeOptions}
                placeholder="Tipo"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {sortedTransactions.map((transaction, index) => {
              const project = projects.find((p) => p.id === transaction.projectId);
              const client = clients.find((c) => c.id === transaction.clientId);
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(transaction.date), "dd MMM yyyy", { locale: pt })}</span>
                        </div>
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
            })}
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
    </AppLayout>
  );
}
