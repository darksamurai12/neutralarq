import { useState, useEffect } from 'react';
import { Task, TaskStatus, Subtask, Comment } from '@/types';
import { Plus, Trash2, MessageSquare, ListChecks, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskEditDialog({
  task,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: TaskEditDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsible: '',
    deadline: '',
    status: 'todo' as TaskStatus,
    subtasks: [] as Subtask[],
    comments: [] as Comment[],
  });
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        responsible: task.responsible,
        deadline: task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '',
        status: task.status,
        subtasks: task.subtasks || [],
        comments: task.comments || [],
      });
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;
    onSave(task.id, {
      title: formData.title,
      description: formData.description,
      responsible: formData.responsible,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
      status: formData.status,
      subtasks: formData.subtasks,
      comments: formData.comments,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!task) return;
    onDelete(task.id);
    onOpenChange(false);
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormData({
      ...formData,
      subtasks: [
        ...formData.subtasks,
        { id: crypto.randomUUID(), title: newSubtask.trim(), completed: false },
      ],
    });
    setNewSubtask('');
  };

  const toggleSubtask = (id: string) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const removeSubtask = (id: string) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((s) => s.id !== id),
    });
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setFormData({
      ...formData,
      comments: [
        ...formData.comments,
        {
          id: crypto.randomUUID(),
          content: newComment.trim(),
          author: 'Usuário',
          createdAt: new Date(),
        },
      ],
    });
    setNewComment('');
  };

  const removeComment = (id: string) => {
    setFormData({
      ...formData,
      comments: formData.comments.filter((c) => c.id !== id),
    });
  };

  const completedSubtasks = formData.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = formData.subtasks.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="info" className="gap-2">
              <Info className="w-4 h-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-2">
              <ListChecks className="w-4 h-4" />
              Checklist
              {totalSubtasks > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Comentários
              {formData.comments.length > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {formData.comments.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título da tarefa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada da tarefa"
                rows={3}
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
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Nova sub-tarefa"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              />
              <Button type="button" size="icon" onClick={addSubtask}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {totalSubtasks > 0 && (
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-300"
                  style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formData.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border border-border bg-card',
                    subtask.completed && 'bg-muted/50'
                  )}
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(subtask.id)}
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      subtask.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSubtask(subtask.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {formData.subtasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma sub-tarefa adicionada
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 mt-4">
            <div className="flex items-start gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                rows={2}
                className="flex-1"
              />
              <Button type="button" size="icon" onClick={addComment} className="mt-1">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {formData.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{comment.author}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeComment(comment.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              ))}
              {formData.comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum comentário adicionado
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
