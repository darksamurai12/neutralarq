"use client";

import { Note, NoteList, NotePriority, NoteType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, Pin, Archive, Calendar as CalendarIcon, 
  Flag, ListChecks, Type, MoreVertical, 
  CheckSquare, X, Plus, Copy, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface NoteDetailColumnProps {
  note: Note | null;
  lists: NoteList[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onAddChecklistItem: (noteId: string, desc: string) => void;
  onToggleChecklistItem: (itemId: string, completed: boolean) => void;
  onDeleteChecklistItem: (itemId: string) => void;
  onConvertToTask: (note: Note) => void;
}

export function NoteDetailColumn({ 
  note, lists, onUpdate, onDelete, 
  onAddChecklistItem, onToggleChecklistItem, onDeleteChecklistItem,
  onConvertToTask
}: NoteDetailColumnProps) {
  const [newItem, setNewItem] = (window as any).React.useState('');

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/30 dark:bg-slate-900/30">
        <div className="text-center">
          <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-10 h-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-medium">Seleccione uma nota para editar</p>
        </div>
      </div>
    );
  }

  const handleAddItem = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newItem.trim()) {
      onAddChecklistItem(note.id, newItem);
      setNewItem('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Toolbar */}
      <div className="h-14 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Select value={note.listId || 'none'} onValueChange={(v) => onUpdate(note.id, { listId: v === 'none' ? null : v })}>
            <SelectTrigger className="h-8 border-none bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold w-32">
              <SelectValue placeholder="Lista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem Lista</SelectItem>
              {lists.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={note.priority} onValueChange={(v: NotePriority) => onUpdate(note.id, { priority: v })}>
            <SelectTrigger className="h-8 border-none bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">🚨 Urgente</SelectItem>
              <SelectItem value="high">🟠 Alta</SelectItem>
              <SelectItem value="medium">🔵 Média</SelectItem>
              <SelectItem value="low">⚪ Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" size="icon" 
            className={cn("h-9 w-9 rounded-xl", note.isPinned && "text-amber-500 bg-amber-50")}
            onClick={() => onUpdate(note.id, { isPinned: !note.isPinned })}
          >
            <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("h-9 w-9 rounded-xl", note.reminderDate && "text-primary bg-primary/5")}>
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-xl rounded-2xl">
              <Calendar mode="single" selected={note.reminderDate || undefined} onSelect={(d) => onUpdate(note.id, { reminderDate: d || null })} initialFocus locale={ptBR} />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50" onClick={() => onConvertToTask(note)} title="Converter em Tarefa">
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-slate-100 dark:bg-slate-800 mx-2" />

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50" onClick={() => onDelete(note.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 max-w-4xl mx-auto w-full">
        <Input
          value={note.title}
          onChange={(e) => onUpdate(note.id, { title: e.target.value })}
          placeholder="Título da nota..."
          className="text-3xl font-black border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto mb-8 placeholder:opacity-20"
        />

        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant={note.type === 'text' ? 'secondary' : 'ghost'} 
            size="sm" className="rounded-lg gap-2 h-8 text-xs font-bold"
            onClick={() => onUpdate(note.id, { type: 'text' })}
          >
            <Type className="w-3.5 h-3.5" /> Texto
          </Button>
          <Button 
            variant={note.type === 'checklist' ? 'secondary' : 'ghost'} 
            size="sm" className="rounded-lg gap-2 h-8 text-xs font-bold"
            onClick={() => onUpdate(note.id, { type: 'checklist' })}
          >
            <ListChecks className="w-3.5 h-3.5" /> Checklist
          </Button>
        </div>

        {note.type === 'text' ? (
          <Textarea
            value={note.content}
            onChange={(e) => onUpdate(note.id, { content: e.target.value })}
            placeholder="Escreva os detalhes aqui..."
            className="min-h-[400px] border-none bg-transparent shadow-none focus-visible:ring-0 px-0 resize-none text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {note.checklistItems?.map(item => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <Checkbox 
                    checked={item.isCompleted} 
                    onCheckedChange={(checked) => onToggleChecklistItem(item.id, !!checked)}
                    className="rounded-md h-5 w-5"
                  />
                  <span className={cn(
                    "flex-1 text-lg transition-all",
                    item.isCompleted ? "text-slate-300 line-through" : "text-slate-600 dark:text-slate-300"
                  )}>
                    {item.description}
                  </span>
                  <Button 
                    variant="ghost" size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-rose-400"
                    onClick={() => onDeleteChecklistItem(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="relative group pt-4">
              <Plus className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input
                placeholder="Adicionar item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleAddItem}
                className="pl-8 border-none bg-transparent shadow-none focus-visible:ring-0 text-lg"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-50 dark:border-slate-800 text-[10px] font-bold text-slate-300 uppercase tracking-widest flex justify-between">
        <span>Criada em {format(note.createdAt, "dd/MM/yyyy HH:mm")}</span>
        <span>Atualizada em {format(note.updatedAt, "dd/MM/yyyy HH:mm")}</span>
      </div>
    </div>
  );
}