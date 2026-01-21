import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionType } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

export default function Finance() {
  const { transactions, projects, clients, addTransaction } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    type: 'income' as TransactionType,
    projectId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const project = projects.find((p) => p.id === formData.projectId);
    addTransaction({
      description: formData.description,
      value: parseFloat(formData.value),
      type: formData.type,
      projectId: formData.projectId || null,
      clientId: project?.clientId || null,
      date: new Date(formData.date),
    });
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
    setIsDialogOpen(false);
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);

  return (
    <AppLayout>
      <PageHeader
        title="Finanças"
        description="Controle de fluxo de caixa"
        icon={Wallet}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
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
                <Button type="submit">Adicionar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span>Total Entradas</span>
          </div>
          <p className="text-xl font-semibold text-success">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span>Total Saídas</span>
          </div>
          <p className="text-xl font-semibold text-destructive">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Wallet className="w-4 h-4 text-primary" />
            <span>Saldo</span>
          </div>
          <p className={cn(
            'text-xl font-semibold',
            totalIncome - totalExpenses >= 0 ? 'text-primary' : 'text-destructive'
          )}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Histórico de Transações</h3>
        </div>
        <div className="divide-y divide-border">
          {sortedTransactions.map((transaction) => {
            const project = projects.find((p) => p.id === transaction.projectId);
            const client = clients.find((c) => c.id === transaction.clientId);
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                  )}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(transaction.date), 'dd/MM/yyyy')}</span>
                      {project && (
                        <>
                          <span>•</span>
                          <span>{project.name}</span>
                        </>
                      )}
                      {client && (
                        <>
                          <span>•</span>
                          <span>{client.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className={cn(
                  'font-semibold text-lg',
                  transaction.type === 'income' ? 'text-success' : 'text-destructive'
                )}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
