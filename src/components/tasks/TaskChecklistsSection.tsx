import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

interface TaskChecklistsSectionProps {
  checklists: Checklist[];
  onAddChecklist: (name: string) => void;
  onRemoveChecklist: (id: string) => void;
  onAddItem: (checklistId: string, title: string) => void;
  onToggleItem: (checklistId: string, itemId: string) => void;
  onRemoveItem: (checklistId: string, itemId: string) => void;
}

export function TaskChecklistsSection({
  checklists,
  onAddChecklist,
  onRemoveChecklist,
  onAddItem,
  onToggleItem,
  onRemoveItem,
}: TaskChecklistsSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');

  const handleCreateChecklist = () => {
    if (newChecklistName.trim()) {
      onAddChecklist(newChecklistName.trim());
      setNewChecklistName('');
      setIsCreating(false);
    }
  };

  const handleAddItem = (checklistId: string) => {
    if (newItemTitle.trim()) {
      onAddItem(checklistId, newItemTitle.trim());
      setNewItemTitle('');
      setAddingItemTo(null);
    }
  };

  return (
    <div className="py-4 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">Checklists</h3>

      {checklists.map((checklist) => {
        const completedCount = checklist.items.filter((i) => i.completed).length;
        const progress = checklist.items.length > 0 
          ? (completedCount / checklist.items.length) * 100 
          : 0;

        return (
          <Collapsible key={checklist.id} defaultOpen className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{checklist.name}</span>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{checklist.items.length}
                </span>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveChecklist(checklist.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            {checklist.items.length > 0 && (
              <Progress value={progress} className="h-1.5 mb-2" />
            )}

            <CollapsibleContent>
              <div className="space-y-1 pl-6">
                {checklist.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center gap-3 p-1.5 rounded-md hover:bg-muted/50 group',
                      item.completed && 'opacity-60'
                    )}
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => onToggleItem(checklist.id, item.id)}
                    />
                    <span
                      className={cn(
                        'flex-1 text-sm',
                        item.completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {item.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveItem(checklist.id, item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {addingItemTo === checklist.id ? (
                  <div className="flex items-center gap-2 pl-6 mt-2">
                    <Input
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      placeholder="Nome do item"
                      className="h-7 text-sm flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(checklist.id);
                        }
                        if (e.key === 'Escape') {
                          setAddingItemTo(null);
                          setNewItemTitle('');
                        }
                      }}
                    />
                    <Button size="sm" className="h-7" onClick={() => handleAddItem(checklist.id)}>
                      Adicionar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 pl-6 text-muted-foreground"
                    onClick={() => setAddingItemTo(checklist.id)}
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar item
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {isCreating ? (
        <div className="flex items-center gap-2">
          <Input
            value={newChecklistName}
            onChange={(e) => setNewChecklistName(e.target.value)}
            placeholder="Nome do checklist"
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateChecklist();
              }
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewChecklistName('');
              }
            }}
          />
          <Button size="sm" onClick={handleCreateChecklist}>
            Criar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsCreating(false);
              setNewChecklistName('');
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
          onClick={() => setIsCreating(true)}
        >
          <Plus className="w-3 h-3" />
          Criar checklist
        </Button>
      )}
    </div>
  );
}
