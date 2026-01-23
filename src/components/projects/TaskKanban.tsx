import { useState } from 'react';
import { Task, TaskStatus, TaskPriority, ProjectPhase } from '@/types';
import { Plus, Calendar, User, GripVertical, Pencil, AlertTriangle, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskEditDialog } from '@/components/tasks/TaskEditDialog';

interface TaskKanbanProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  projectId: string;
}

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'A Fazer', color: 'bg-muted border-muted-foreground/20' },
  { status: 'doing', label: 'Em Progresso', color: 'bg-primary/10 border-primary/30' },
  { status: 'review', label: 'Em Revisão', color: 'bg-warning/10 border-warning/30' },
  { status: 'done', label: 'Concluído', color: 'bg-success/10 border-success/30' },
];

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Baixa', className: 'text-muted-foreground' },
  medium: { label: 'Média', className: 'text-primary' },
  high: { label: 'Alta', className: 'text-warning' },
  critical: { label: 'Crítica', className: 'text-destructive' },
};

const phaseConfig: Record<ProjectPhase, string> = {
  projeto: 'Projecto',
  obra: 'Obra',
  acabamento: 'Acabamento',
  entrega: 'Entrega',
};

export function TaskKanban({ tasks, onAddTask, onUpdateTask, onDeleteTask, projectId }: TaskKanbanProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsible: '',
    deadline: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    phase: 'projeto' as ProjectPhase,
  });

  // Filter states
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<ProjectPhase | 'all'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      projectId,
      title: formData.title,
      description: formData.description,
      responsible: formData.responsible,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      status: formData.status,
      priority: formData.priority,
      phase: formData.phase,
      completionPercentage: 0,
      subtasks: [],
      comments: [],
    });
    setFormData({ title: '', description: '', responsible: '', deadline: '', status: 'todo', priority: 'medium', phase: 'projeto' });
    setIsDialogOpen(false);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const completionPercentage = newStatus === 'done' ? 100 : newStatus === 'review' ? 80 : newStatus === 'doing' ? 50 : 0;
    onUpdateTask(taskId, { status: newStatus, completionPercentage });
  };

  const getResponsibles = () => {
    const responsibles = tasks.map(t => t.responsible).filter(Boolean);
    return [...new Set(responsibles)];
  };

  const getFilteredTasks = (status: TaskStatus) => {
    return tasks.filter((task) => {
      const matchesStatus = task.status === status;
      const matchesResponsible = responsibleFilter === 'all' || task.responsible === responsibleFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesPhase = phaseFilter === 'all' || task.phase === phaseFilter;
      return matchesStatus && matchesResponsible && matchesPriority && matchesPhase;
    });
  };

  const getSubtaskProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(s => s.completed).length;
    return `${completed}/${task.subtasks.length}`;
  };

  const isOverdue = (task: Task) => {
    return task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-semibold text-foreground">Tarefas do Projecto</h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-3 h-3" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Desenvolver projecto de fundações"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva a tarefa..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsible">Responsável</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phase">Fase</Label>
                  <Select
                    value={formData.phase}
                    onValueChange={(value: ProjectPhase) => setFormData({ ...formData, phase: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="projeto">Projecto</SelectItem>
                      <SelectItem value="obra">Obra</SelectItem>
                      <SelectItem value="acabamento">Acabamento</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">A Fazer</SelectItem>
                      <SelectItem value="doing">Em Progresso</SelectItem>
                      <SelectItem value="review">Em Revisão</SelectItem>
                      <SelectItem value="done">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Tarefa</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {getResponsibles().map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>

        <Select value={phaseFilter} onValueChange={(v) => setPhaseFilter(v as ProjectPhase | 'all')}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="projeto">Projecto</SelectItem>
            <SelectItem value="obra">Obra</SelectItem>
            <SelectItem value="acabamento">Acabamento</SelectItem>
            <SelectItem value="entrega">Entrega</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-2">
        {columns.map((column) => (
          <div
            key={column.status}
            className={cn(
              'rounded-lg border p-2 min-h-[200px]',
              column.color
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {column.label}
              </h5>
              <span className="text-xs bg-background/50 px-1.5 py-0.5 rounded-full text-muted-foreground">
                {getFilteredTasks(column.status).length}
              </span>
            </div>
            <div className="space-y-2">
              {getFilteredTasks(column.status).map((task) => {
                const subtaskProgress = getSubtaskProgress(task);
                const overdue = isOverdue(task);
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "bg-card rounded-md border p-2 shadow-sm hover:shadow-md transition-shadow",
                      overdue ? "border-destructive/50" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <Flag className={cn("w-3 h-3", priorityConfig[task.priority].className)} />
                          {overdue && <AlertTriangle className="w-3 h-3 text-destructive" />}
                        </div>
                        <p className="text-xs font-medium text-foreground line-clamp-2">{task.title}</p>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded mt-1 inline-block">
                          {phaseConfig[task.phase]}
                        </span>
                        {task.responsible && (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                            <User className="w-2.5 h-2.5" />
                            <span className="truncate">{task.responsible}</span>
                          </div>
                        )}
                        {task.deadline && (
                          <div className={cn(
                            "flex items-center gap-1 mt-0.5 text-[10px]",
                            overdue ? "text-destructive" : "text-muted-foreground"
                          )}>
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{format(new Date(task.deadline), "dd/MM/yy", { locale: ptBR })}</span>
                          </div>
                        )}
                        {subtaskProgress && (
                          <div className="mt-1.5">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                              <span>Checklist</span>
                              <span>{subtaskProgress}</span>
                            </div>
                            <div className="h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-success transition-all"
                                style={{
                                  width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {task.completionPercentage}% concluído
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border">
                      <Select
                        value={task.status}
                        onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}
                      >
                        <SelectTrigger className="h-6 text-[10px] w-20 px-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">A Fazer</SelectItem>
                          <SelectItem value="doing">Em Progresso</SelectItem>
                          <SelectItem value="review">Em Revisão</SelectItem>
                          <SelectItem value="done">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-muted-foreground hover:text-primary"
                        onClick={() => setEditingTask(task)}
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {getFilteredTasks(column.status).length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-4">
                  Nenhuma tarefa
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={onUpdateTask}
        onDelete={onDeleteTask}
      />
    </div>
  );
}
