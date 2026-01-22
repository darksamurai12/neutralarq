import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { FolderKanban, Plus, Calendar, DollarSign, User, TrendingUp, TrendingDown, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { TaskKanban } from '@/components/projects/TaskKanban';
import { formatCurrency } from '@/lib/currency';
import { SearchFilter } from '@/components/filters/SearchFilter';
import { StatusFilter } from '@/components/filters/StatusFilter';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: { label: 'Planejamento', className: 'bg-muted text-muted-foreground border-border' },
  in_progress: { label: 'Em Curso', className: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Concluído', className: 'bg-success/10 text-success border-success/20' },
};

const statusOptions = [
  { value: 'planning' as const, label: 'Planejamento' },
  { value: 'in_progress' as const, label: 'Em Curso' },
  { value: 'completed' as const, label: 'Concluído' },
];

const emptyFormData = {
  name: '',
  clientId: '',
  deadline: '',
  budget: '',
  status: 'planning' as ProjectStatus,
};

export default function Projects() {
  const { projects, clients, addProject, updateProject, deleteProject, getProjectWithDetails, addTask, updateTask, deleteTask } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const selectedProject = selectedProjectId ? getProjectWithDetails(selectedProjectId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProject(editingProject.id, {
        name: formData.name,
        clientId: formData.clientId,
        deadline: new Date(formData.deadline),
        budget: parseFloat(formData.budget),
        status: formData.status,
      });
    } else {
      addProject({
        name: formData.name,
        clientId: formData.clientId,
        deadline: new Date(formData.deadline),
        budget: parseFloat(formData.budget),
        status: formData.status,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingProject(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (project: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProject(project);
    setFormData({
      name: project.name,
      clientId: project.clientId,
      deadline: format(new Date(project.deadline), 'yyyy-MM-dd'),
      budget: project.budget.toString(),
      status: project.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    deleteProject(id);
  };

  const filteredProjects = projects.filter((project) => {
    const client = clients.find((c) => c.id === project.clientId);
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Projetos"
        description="Gestão de projetos e entregas"
        icon={FolderKanban}
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
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
                  <Label htmlFor="budget">Orçamento (AOA)</Label>
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
                <Button type="submit">{editingProject ? 'Salvar' : 'Criar Projeto'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 max-w-sm">
          <SearchFilter
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Pesquisar projetos..."
          />
        </div>
        <StatusFilter<ProjectStatus>
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          options={statusOptions}
        />
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const client = clients.find((c) => c.id === project.clientId);
          return (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className="rounded-xl border border-border bg-card p-5 shadow-card cursor-pointer transition-all hover:shadow-elevated hover:border-primary/30 animate-in-up"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground line-clamp-1 flex-1">{project.name}</h3>
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant="outline" className={cn('flex-shrink-0', statusConfig[project.status].className)}>
                    {statusConfig[project.status].label}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleEdit(project, e)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => handleDelete(project.id, e)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            Nenhum projeto encontrado
          </div>
        )}
      </div>

      {/* Project Detail Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {selectedProject && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl">{selectedProject.name}</SheetTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        handleEdit(selectedProject);
                        setSelectedProjectId(null);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        deleteProject(selectedProject.id);
                        setSelectedProjectId(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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

              {/* Task Kanban */}
              <div className="mb-6">
                <TaskKanban
                  tasks={selectedProject.tasks}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  projectId={selectedProject.id}
                />
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
