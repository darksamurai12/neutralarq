import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Pencil, 
  Trash2, 
  MoreHorizontal, 
  Building2, 
  CalendarClock,
  Clock,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Project, ProjectStatus, ProjectType } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { TaskKanban } from '@/components/projects/TaskKanban';
import { ProjectKPIs } from '@/components/projects/ProjectKPIs';
import { ProjectHistory } from '@/components/projects/ProjectHistory';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { SubprojectsList } from '@/components/projects/SubprojectsList';
import { formatCurrency } from '@/lib/currency';

const statusConfig: Record<ProjectStatus, { label: string; className: string; bgClass: string; icon: React.ElementType }> = {
  planning: { label: 'Planeamento', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', bgClass: 'from-slate-500 to-slate-600', icon: Clock },
  in_progress: { label: 'Em Execução', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', bgClass: 'from-blue-500 to-blue-600', icon: PlayCircle },
  paused: { label: 'Parado', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', bgClass: 'from-amber-500 to-amber-600', icon: PauseCircle },
  completed: { label: 'Concluído', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', bgClass: 'from-emerald-500 to-emerald-600', icon: CheckCircle2 },
};

const typeConfig: Record<ProjectType, { label: string; icon: string; color: string }> = {
  architecture: { label: 'Arquitectura', icon: '🏛️', color: 'from-violet-500 to-violet-600' },
  construction: { label: 'Construção Civil', icon: '🏗️', color: 'from-orange-500 to-orange-600' },
  interior_design: { label: 'Design de Interiores', icon: '🎨', color: 'from-pink-500 to-pink-600' },
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
  const { projects, clients, addProject, updateProject, deleteProject, getProjectWithDetails, addTask, updateTask, deleteTask, getSubprojects } = useApp();
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

  // Only show root-level projects (not subprojects) in the main list
  const rootProjects = projects.filter(p => !p.parentProjectId);

  // Stats (only root projects)
  const planningProjects = rootProjects.filter(p => p.status === 'planning').length;
  const activeProjects = rootProjects.filter(p => p.status === 'in_progress').length;
  const pausedProjects = rootProjects.filter(p => p.status === 'paused').length;
  const completedProjects = rootProjects.filter(p => p.status === 'completed').length;

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
      parentProjectId: null as string | null,
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

  const filteredProjects = rootProjects.filter((project) => {
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
            <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
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
                      <SelectItem value="architecture">🏛️ Arquitectura</SelectItem>
                      <SelectItem value="construction">🏗️ Construção Civil</SelectItem>
                      <SelectItem value="interior_design">🎨 Design de Interiores</SelectItem>
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
                <Button type="submit">{editingProject ? 'Guardar' : 'Criar Projecto'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Em Planeamento</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{planningProjects}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Em Execução</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{activeProjects}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-amber transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <PauseCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Parados</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{pausedProjects}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Concluídos</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{completedProjects}</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-border/50 rounded-2xl mb-6">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const client = clients.find((c) => c.id === project.clientId);
          const projectDetails = getProjectWithDetails(project.id);
          const progress = projectDetails?.kpis.progressPercentage || 0;
          const StatusIcon = statusConfig[project.status].icon;
          const subprojectCount = getSubprojects(project.id).length;
          
          return (
            <Card
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className="group cursor-pointer shadow-lg border-0 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Type Banner */}
              <div className={cn(
                'h-2 bg-gradient-to-r',
                typeConfig[project.type].color
              )} />
              
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeConfig[project.type].icon}</span>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{typeConfig[project.type].label}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleEdit(project, e)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => handleDelete(project.id, e)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{client?.name || 'Cliente não encontrado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="w-4 h-4 flex-shrink-0" />
                    <span>{format(new Date(project.deadline), "dd MMM yyyy", { locale: pt })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-semibold text-foreground">{formatCurrency(project.budget)}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progresso</span>
                    <span className="text-xs font-medium text-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <Badge variant="outline" className={cn('font-medium gap-1', statusConfig[project.status].className)}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig[project.status].label}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {subprojectCount > 0 && (
                      <span className="text-xs text-primary font-medium flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {subprojectCount} sub
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {projectDetails?.tasks.length || 0} tarefa{(projectDetails?.tasks.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-span-full">
            <Card className="shadow-lg border-0">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <FolderKanban className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Nenhum projecto encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros ou adicione um novo projecto</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Project Detail Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={() => setSelectedProjectId(null)}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          {selectedProject && (
            <>
              {/* Breadcrumb for subprojects */}
              {selectedProject.parentProjectId && (
                <button
                  onClick={() => setSelectedProjectId(selectedProject.parentProjectId)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline mb-3 transition-colors"
                >
                  <ArrowUpRight className="w-3 h-3 rotate-[225deg]" />
                  Voltar ao projecto principal
                </button>
              )}
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'h-14 w-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br',
                      typeConfig[selectedProject.type].color
                    )}>
                      {typeConfig[selectedProject.type].icon}
                    </div>
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
                <Badge variant="outline" className={cn('w-fit mt-3 gap-1', statusConfig[selectedProject.status].className)}>
                  {React.createElement(statusConfig[selectedProject.status].icon, { className: 'w-3 h-3' })}
                  {statusConfig[selectedProject.status].label}
                </Badge>
              </SheetHeader>

              {/* Project Info */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 space-y-4">
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
                <TabsList className="w-full grid grid-cols-5 mb-4">
                  <TabsTrigger value="kpis">KPIs</TabsTrigger>
                  <TabsTrigger value="subprojects" className="gap-1">
                    Sub
                    {getSubprojects(selectedProject.id).length > 0 && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1 rounded-full">
                        {getSubprojects(selectedProject.id).length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="kanban">Tarefas</TabsTrigger>
                  <TabsTrigger value="finance">Finanças</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                <TabsContent value="kpis">
                  <ProjectKPIs kpis={selectedProject.kpis} budget={selectedProject.budget} />
                </TabsContent>

                <TabsContent value="subprojects">
                  <SubprojectsList
                    parentProject={selectedProject}
                    subprojects={getSubprojects(selectedProject.id)}
                    onSelectSubproject={(id) => setSelectedProjectId(id)}
                  />
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
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Extrato Financeiro
                    </h4>
                    {selectedProject.transactions.length === 0 ? (
                      <div className="text-center py-12 rounded-xl bg-muted/30 border border-dashed border-border">
                        <p className="text-sm text-muted-foreground">Nenhuma transação registada</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedProject.transactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(transaction.date), "dd/MM/yyyy")}
                              </p>
                            </div>
                            <span className={cn(
                              'font-bold',
                              transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
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
