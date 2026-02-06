import { Plus, Trash2 } from 'lucide-react';
import { Subtask } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TaskSubtasksSectionProps {
  subtasks: Subtask[];
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TaskSubtasksSection({
  subtasks,
  onAdd,
  onToggle,
  onRemove,
}: TaskSubtasksSectionProps) {
  const [newSubtask, setNewSubtask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newSubtask.trim()) {
      onAdd(newSubtask.trim());
      setNewSubtask('');
      setIsAdding(false);
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="py-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Adicionar subtarefa</h3>
        {subtasks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCount}/{subtasks.length}
          </span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div className="space-y-2 mb-3">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group',
                subtask.completed && 'opacity-60'
              )}
            >
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={() => onToggle(subtask.id)}
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
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(subtask.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Nome da subtarefa"
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewSubtask('');
              }
            }}
          />
          <Button size="sm" onClick={handleAdd}>
            Adicionar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewSubtask('');
            }}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-3 h-3" />
          Add Tarefa
        </Button>
      )}
    </div>
  );
}
