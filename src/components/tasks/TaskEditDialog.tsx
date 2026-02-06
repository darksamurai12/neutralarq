import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, ProjectPhase, Subtask, Comment } from '@/types';
import { Trash2, X, FileText } from 'lucide-react';
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
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [metadata, setMetadata] = useState({
    deadline: '',
    startDate: '',
    priority: 'medium' as TaskPriority,
    phase: 'projeto' as ProjectPhase,
    estimatedTime: '',
    trackedTime: '',
    tags: [] as string[],
    relatedTaskId: '',
  });
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setMetadata({
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        startDate: task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : '',
        priority: task.priority,
        phase: task.phase,
        estimatedTime: '',
        trackedTime: '',
        tags: [],
        relatedTaskId: '',
      });
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
      setChecklists([]);
      setAttachments([]);
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;
    onSave(task.id, {
      title,
      description,
      status,
      priority: metadata.priority,
      phase: metadata.phase,
      deadline: metadata.deadline ? new Date(metadata.deadline) : null,
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

  // Subtasks handlers
  const addSubtask = (title: string) => {
    setSubtasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, completed: false },
    ]);
  };

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  // Checklists handlers
  const addChecklist = (name: string) => {
    setChecklists((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, items: [] },
    ]);
  };

  const removeChecklist = (id: string) => {
    setChecklists((prev) => prev.filter((c) => c.id !== id));
  };

  const addChecklistItem = (checklistId: string, title: string) => {
    setChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId
          ? {
              ...c,
              items: [
                ...c.items,
                { id: crypto.randomUUID(), title, completed: false },
              ],
            }
          : c
      )
    );
  };

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, completed: !i.completed } : i
              ),
            }
          : c
      )
    );
  };

  const removeChecklistItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      )
    );
  };

  // Attachments handlers
  const handleAddAttachment = () => {
    // TODO: Implement file upload
    console.log('Add attachment clicked');
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Calculate overall progress
  const calculateProgress = () => {
    const allItems = [
      ...subtasks,
      ...checklists.flatMap((c) => c.items),
    ];
    if (allItems.length === 0) return 0;
    const completed = allItems.filter((i) => i.completed).length;
    return Math.round((completed / allItems.length) * 100);
  };

  const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
    todo: { label: 'A Fazer', color: 'bg-muted' },
    doing: { label: 'Em Progresso', color: 'bg-blue-500' },
    review: { label: 'Em Revisão', color: 'bg-yellow-500' },
    done: { label: 'Concluído', color: 'bg-success' },
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-border sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Select value={status} onValueChange={(v: TaskStatus) => setStatus(v)}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 p-4 space-y-0">
            {/* Title */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da tarefa"
              className="text-lg font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0"
            />

            {/* Metadata Grid */}
            <TaskMetadataGrid
              formData={metadata}
              onChange={handleMetadataChange}
            />

            {/* Description */}
            <div className="py-4 border-b border-border">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicionar descrição"
                  className="flex-1 min-h-[100px] border-none shadow-none px-0 resize-none focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Subtasks */}
            <TaskSubtasksSection
              subtasks={subtasks}
              onAdd={addSubtask}
              onToggle={toggleSubtask}
              onRemove={removeSubtask}
            />

            {/* Checklists */}
            <TaskChecklistsSection
              checklists={checklists}
              onAddChecklist={addChecklist}
              onRemoveChecklist={removeChecklist}
              onAddItem={addChecklistItem}
              onToggleItem={toggleChecklistItem}
              onRemoveItem={removeChecklistItem}
            />

            {/* Attachments */}
            <TaskAttachmentsSection
              attachments={attachments}
              onAdd={handleAddAttachment}
              onRemove={removeAttachment}
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border sticky bottom-0 bg-background">
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar Alterações</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
