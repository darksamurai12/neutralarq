import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskType, Subtask, Comment } from '@/types';
import { Trash2, X, FileText, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskMetadataGrid } from './TaskMetadataGrid';
import { TaskSubtasksSection } from './TaskSubtasksSection';
import { TaskChecklistsSection, Checklist } from './TaskChecklistsSection';
import { TaskAttachmentsSection, Attachment } from './TaskAttachmentsSection';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [metadata, setMetadata] = useState({
    deadline: '',
    startDate: '',
    priority: 'medium' as TaskPriority,
    type: 'internal' as TaskType,
    responsible: '',
    estimatedTime: '',
    trackedTime: '',
    tags: [] as string[],
  });
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setMetadata({
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        priority: task.priority,
        type: task.type,
        responsible: task.responsible,
        estimatedTime: '',
        trackedTime: '',
        tags: [],
      });
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;
    onSave(task.id, {
      title,
      description,
      status,
      priority: metadata.priority,
      type: metadata.type,
      responsible: metadata.responsible,
      deadline: metadata.deadline ? new Date(metadata.deadline) : task.deadline,
      startDate: metadata.startDate ? new Date(metadata.startDate) : task.startDate,
      subtasks,
      comments,
      completionPercentage: calculateProgress(),
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!task) return;
    onDelete(task.id);
    onOpenChange(false);
  };

  const handleMetadataChange = (field: string, value: any) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  const calculateProgress = () => {
    if (subtasks.length === 0) return status === 'completed' ? 100 : 0;
    const completed = subtasks.filter((s) => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-slate-400' },
    in_progress: { label: 'Em andamento', color: 'bg-blue-500' },
    completed: { label: 'Concluída', color: 'bg-emerald-500' },
    canceled: { label: 'Cancelada', color: 'bg-rose-500' },
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Select value={status} onValueChange={(v: TaskStatus) => setStatus(v)}>
                  <SelectTrigger className="h-8 w-40 text-xs bg-white dark:bg-slate-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', config.color)} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 p-6 space-y-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da tarefa"
              className="text-2xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0"
            />

            <TaskMetadataGrid
              formData={metadata}
              onChange={handleMetadataChange}
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4" /> Descrição
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicionar descrição detalhada..."
                className="min-h-[120px] bg-slate-50 dark:bg-slate-900 border-none rounded-xl resize-none focus-visible:ring-primary/20"
              />
            </div>

            <TaskSubtasksSection
              subtasks={subtasks}
              onAdd={(title) => setSubtasks([...subtasks, { id: crypto.randomUUID(), title, completed: false }])}
              onToggle={(id) => setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s))}
              onRemove={(id) => setSubtasks(subtasks.filter(s => s.id !== id))}
            />

            <div className="pt-4">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <Paperclip className="w-4 h-4" /> Anexar Ficheiro
              </Button>
            </div>
          </div>

          <div className="p-4 border-t border-border sticky bottom-0 bg-background">
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="rounded-xl px-8">Salvar Alterações</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}