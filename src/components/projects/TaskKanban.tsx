import { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { Plus, Calendar, User, GripVertical, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { format } from 'date-fns';
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
  { status: 'done', label: 'Concluído', color: 'bg-success/10 border-success/30' },
];

export function TaskKanban({ tasks, onAddTask, onUpdateTask, onDeleteTask, projectId }: TaskKanbanProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    responsible: '',
    deadline: '',
    status: 'todo' as TaskStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      projectId,
      title: formData.title,
      description: '',
      responsible: formData.responsible,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      status: formData.status,
      subtasks: [],
      comments: [],
    });
    setFormData({ title: '', responsible: '', deadline: '', status: 'todo' });
    setIsDialogOpen(false);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTask(taskId, { status: newStatus });
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const getSubtaskProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(s => s.completed).length;
    return `${completed}/${task.subtasks.length}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Tarefas do Projeto</h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-3 h-3" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                  placeholder="Ex: Desenvolver API"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
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

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-3">
        {columns.map((column) => (
          <div
            key={column.status}
            className={cn(
              'rounded-lg border p-3 min-h-[200px]',
              column.color
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {column.label}
              </h5>
              <span className="text-xs bg-background/50 px-2 py-0.5 rounded-full text-muted-foreground">
                {getTasksByStatus(column.status).length}
              </span>
            </div>
            <div className="space-y-2">
              {getTasksByStatus(column.status).map((task) => {
                const subtaskProgress = getSubtaskProgress(task);
                return (
                  <div
                    key={task.id}
                    className="bg-card rounded-md border border-border p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{task.title}</p>
                        {task.responsible && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span className="truncate">{task.responsible}</span>
                          </div>
                        )}
                        {task.deadline && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(task.deadline), "dd/MM/yy", { locale: ptBR })}</span>
                          </div>
                        )}
                        {subtaskProgress && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Checklist</span>
                              <span>{subtaskProgress}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-success transition-all"
                                style={{
                                  width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                      <Select
                        value={task.status}
                        onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}
                      >
                        <SelectTrigger className="h-7 text-xs w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">A Fazer</SelectItem>
                          <SelectItem value="doing">Em Progresso</SelectItem>
                          <SelectItem value="done">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={() => setEditingTask(task)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {getTasksByStatus(column.status).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
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
