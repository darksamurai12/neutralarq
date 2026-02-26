"use client";

import { Note, NotePriority } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Flag, Pin, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NoteListColumnProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onQuickAdd: (title: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

const priorityColors: Record<NotePriority, string> = {
  urgent: 'text-rose-500',
  high: 'text-amber-500',
  medium: 'text-blue-500',
  low: 'text-slate-400',
};

export function NoteListColumn({ notes, selectedNoteId, onSelectNote, onQuickAdd, searchQuery, onSearchChange }: NoteListColumnProps) {
  const [quickTitle, setQuickTitle] = (window as any).React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickTitle.trim()) {
      onQuickAdd(quickTitle);
      setQuickTitle('');
    }
  };

  return (
    <div className="w-80 flex flex-col border-r border-slate-100 dark:border-slate-800 h-full bg-white dark:bg-slate-900">
      <div className="p-4 border-b border-slate-50 dark:border-slate-800">
        <Input
          placeholder="Pesquisar notas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-primary/20"
        />
      </div>

      <div className="p-4">
        <div className="relative group">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary" />
          <Input
            placeholder="Adicionar nota rápida..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 h-11 rounded-xl border-dashed border-2 border-slate-100 hover:border-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {notes.map(note => {
          const isOverdue = note.reminderDate && isPast(note.reminderDate) && !isToday(note.reminderDate);
          const checklistProgress = note.type === 'checklist' && note.checklistItems?.length 
            ? Math.round((note.checklistItems.filter(i => i.isCompleted).length / note.checklistItems.length) * 100)
            : null;

          return (
            <div
              key={note.id}
              className={cn(
                "p-3 rounded-2xl cursor-pointer transition-all group relative",
                selectedNoteId === note.id 
                  ? "bg-primary/5 border-primary/10 shadow-sm" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
              onClick={() => onSelectNote(note.id)}
            >
              <div className="flex items-start gap-3">
                <Flag className={cn("w-4 h-4 mt-0.5 shrink-0", priorityColors[note.priority])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "text-sm font-bold truncate",
                      selectedNoteId === note.id ? "text-primary" : "text-slate-700 dark:text-slate-200"
                    )}>
                      {note.title || 'Sem título'}
                    </h3>
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-current shrink-0" />}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1.5">
                    {note.reminderDate && (
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-bold uppercase",
                        isOverdue ? "text-rose-500" : "text-slate-400"
                      )}>
                        <Calendar className="w-3 h-3" />
                        {format(note.reminderDate, "dd MMM", { locale: ptBR })}
                      </div>
                    )}
                    {checklistProgress !== null && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        {checklistProgress}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {notes.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xs text-slate-400 italic">Nenhuma nota nesta lista</p>
          </div>
        )}
      </div>
    </div>
  );
}