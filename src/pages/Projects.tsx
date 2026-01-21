import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { FolderKanban, Plus, Calendar, DollarSign, User, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project, ProjectStatus } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: { label: 'Planejamento', className: 'bg-muted text-muted-foreground border-border' },
  in_progress: { label: 'Em Curso', className: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Concluído', className: 'bg-success/10 text-success border-success/20' },
};

export default function Projects() {
  const { projects, clients, addProject, getProjectWithDetails } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    deadline: '',
    budget: '',
    status: 'planning' as ProjectStatus,
  });

  const selectedProject = selectedProjectId ? getProjectWithDetails(selectedProjectId) : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      name: formData.name,
      clientId: formData.clientId,
      deadline: new Date(formData.deadline),
      budget: parseFloat(formData.budget),
      status: formData.status,
    });
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', clientId: '', deadline: '', budget: '', status: 'planning' });
    setIsDialogOpen(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Projetos"
        description="Gestão de projetos e entregas"
        icon={FolderKanban}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Sistema de Gestão"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.filter(c => c.status !== 'inactive').map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planejamento</SelectItem>
                    <SelectItem value="in_progress">Em Curso</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Projeto</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const client = clients.find((c) => c.id === project.clientId);
          return (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className="rounded-xl border border-border bg-card p-5 shadow-card cursor-pointer transition-all hover:shadow-elevated hover:border-primary/30 animate-in-up"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground line-clamp-1">{project.name}</h3>
                <Badge variant="outline" className={cn('ml-2 flex-shrink-0', statusConfig[project.status].className)}>
                  {statusConfig[project.status].label}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{client?.name || 'Cliente não encontrado'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(project.deadline), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium text-foreground">{formatCurrency(project.budget)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Detail Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedProject && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">{selectedProject.name}</SheetTitle>
              </SheetHeader>

              {/* Client Info */}
              <div className="mb-6 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  <span>Cliente</span>
                </div>
                <p className="font-medium text-foreground">
                  {selectedProject.client?.name || 'Cliente não encontrado'}
                </p>
                <p className="text-sm text-muted-foreground">{selectedProject.client?.email}</p>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span>Entradas</span>
                  </div>
                  <p className="text-lg font-semibold text-success">{formatCurrency(selectedProject.totalIncome)}</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span>Saídas</span>
                  </div>
                  <p className="text-lg font-semibold text-destructive">{formatCurrency(selectedProject.totalExpenses)}</p>
                </div>
              </div>

              {/* Profit */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Lucro Real</span>
                  <span className={cn(
                    'text-xl font-bold',
                    selectedProject.profit >= 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {formatCurrency(selectedProject.profit)}
                  </span>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Extrato Financeiro</h4>
                {selectedProject.transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma transação registrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedProject.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <span className={cn(
                          'font-semibold',
                          transaction.type === 'income' ? 'text-success' : 'text-destructive'
                        )}>
                          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
