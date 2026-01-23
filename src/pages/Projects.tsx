import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { FolderKanban, Plus, Calendar, DollarSign, MapPin, Pencil, Trash2, MoreHorizontal, Building2, CalendarClock } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, ProjectStatus, ProjectType } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskKanban } from '@/components/projects/TaskKanban';
import { ProjectKPIs } from '@/components/projects/ProjectKPIs';
import { ProjectHistory } from '@/components/projects/ProjectHistory';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { formatCurrency } from '@/lib/currency';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: { label: 'Planeamento', className: 'bg-muted text-muted-foreground border-border' },
  in_progress: { label: 'Em Execução', className: 'bg-primary/10 text-primary border-primary/20' },
  paused: { label: 'Parado', className: 'bg-warning/10 text-warning border-warning/20' },
  completed: { label: 'Concluído', className: 'bg-success/10 text-success border-success/20' },
};

const typeConfig: Record<ProjectType, { label: string; icon: string }> = {
  architecture: { label: 'Arquitectura', icon: '🏛️' },
  construction: { label: 'Construção Civil', icon: '🏗️' },
  interior_design: { label: 'Design de Interiores', icon: '🎨' },
};

const emptyFormData = {
  name: '',
  clientId: '',
  type: 'architecture' as ProjectType,
  location: '',
  description: '',
  startDate: '',
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
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  const selectedProject = selectedProjectId ? getProjectWithDetails(selectedProjectId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      name: formData.name,
      clientId: formData.clientId,
      type: formData.type,
      location: formData.location,
      description: formData.description,
      startDate: new Date(formData.startDate),
      deadline: new Date(formData.deadline),
      budget: parseFloat(formData.budget),
      status: formData.status,
    };

    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
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
      type: project.type,
      location: project.location,
      description: project.description,
      startDate: format(new Date(project.startDate), 'yyyy-MM-dd'),
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
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    const matchesClient = clientFilter === 'all' || project.clientId === clientFilter;
    return matchesSearch && matchesStatus && matchesType && matchesClient;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Projectos"
        description="Gestão de obras, projectos arquitectónicos e design de interiores"
        icon={FolderKanban}
      >
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Projecto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Editar Projecto' : 'Novo Projecto'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Nome do Projecto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Edifício Comercial Talatona"
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

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Projecto</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ProjectType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="architecture">Arquitectura</SelectItem>
                      <SelectItem value="construction">Construção Civil</SelectItem>
                      <SelectItem value="interior_design">Design de Interiores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="location">Local da Obra</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Talatona, Luanda Sul"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Data Prevista de Conclusão</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento Aprovado (AOA)</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planeamento</SelectItem>
                      <SelectItem value="in_progress">Em Execução</SelectItem>
                      <SelectItem value="paused">Parado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Descrição Geral</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o projecto..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">{editingProject ? 'Salvar' : 'Criar Projecto'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <ProjectFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        clientFilter={clientFilter}
        onClientChange={setClientFilter}
        clients={clients.filter(c => c.status !== 'inactive')}
      />

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
                <div className="flex items-center gap-2">
                  <span className="text-xl">{typeConfig[project.type].icon}</span>
                  <h3 className="font-semibold text-foreground line-clamp-1">{project.name}</h3>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant="outline" className={cn('flex-shrink-0 text-xs', statusConfig[project.status].className)}>
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
                  <Building2 className="w-4 h-4" />
                  <span className="truncate">{client?.name || 'Cliente não encontrado'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{project.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="w-4 h-4" />
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
            Nenhum projecto encontrado
          </div>
        )}
      </div>

      {/* Project Detail Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          {selectedProject && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeConfig[selectedProject.type].icon}</span>
                    <div>
                      <SheetTitle className="text-xl">{selectedProject.name}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{typeConfig[selectedProject.type].label}</p>
                    </div>
                  </div>
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
                <Badge variant="outline" className={cn('w-fit mt-2', statusConfig[selectedProject.status].className)}>
                  {statusConfig[selectedProject.status].label}
                </Badge>
              </SheetHeader>

              {/* Project Info */}
              <div className="mb-6 p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cliente</span>
                    <p className="font-medium text-foreground">{selectedProject.client?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Local</span>
                    <p className="font-medium text-foreground">{selectedProject.location}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data de Início</span>
                    <p className="font-medium text-foreground">{format(new Date(selectedProject.startDate), "dd/MM/yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prazo Previsto</span>
                    <p className="font-medium text-foreground">{format(new Date(selectedProject.deadline), "dd/MM/yyyy")}</p>
                  </div>
                </div>
                {selectedProject.description && (
                  <div>
                    <span className="text-sm text-muted-foreground">Descrição</span>
                    <p className="text-sm text-foreground mt-1">{selectedProject.description}</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="kpis" className="w-full">
                <TabsList className="w-full grid grid-cols-4 mb-4">
                  <TabsTrigger value="kpis">KPIs</TabsTrigger>
                  <TabsTrigger value="kanban">Tarefas</TabsTrigger>
                  <TabsTrigger value="finance">Finanças</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                <TabsContent value="kpis">
                  <ProjectKPIs kpis={selectedProject.kpis} budget={selectedProject.budget} />
                </TabsContent>

                <TabsContent value="kanban">
                  <TaskKanban
                    tasks={selectedProject.tasks}
                    onAddTask={addTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    projectId={selectedProject.id}
                  />
                </TabsContent>

                <TabsContent value="finance">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Extrato Financeiro</h4>
                    {selectedProject.transactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma transação registada
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
                </TabsContent>

                <TabsContent value="history">
                  <ProjectHistory history={selectedProject.history} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
