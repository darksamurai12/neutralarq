"use client";

import { useState } from 'react';
import { Note } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Pin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NoteListColumnProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onQuickAdd: (title: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export function NoteListColumn({
  notes,
  selectedNoteId,
  onSelectNote,
  onQuickAdd,
  searchQuery,
  onSearchChange
}: NoteListColumnProps) {
  const [quickTitle, setQuickTitle] = useState('');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTitle.trim()) {
      onQuickAdd(quickTitle.trim());
      setQuickTitle('');
    }
  };

  return (
    <div className="w-80 flex flex-col border-r border-slate-100 dark:border-slate-800 h-full bg-white dark:bg-slate-900">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-50 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar notas..."
            className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Add */}
      <form onSubmit={handleQuickAdd} className="p-4 border-b border-slate-50 dark:border-slate-800">
        <div className="relative group">
          <Input
            placeholder="Nova nota rápida..."
            className="pr-10 h-10 rounded-xl border-dashed border-2 border-slate-100 hover:border-primary/30 transition-all text-sm"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
          />
          <Button 
            type="submit"
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-300 group-hover:text-primary"
            disabled={!quickTitle.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-400 font-medium">Nenhuma nota encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group relative",
                  selectedNoteId === note.id && "bg-primary/5 border-l-4 border-primary"
                )}
                onClick={() => onSelectNote(note.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={cn(
                    "text-sm font-bold truncate flex-1",
                    selectedNoteId === note.id ? "text-primary" : "text-slate-700 dark:text-slate-200"
                  )}>
                    {note.title || 'Sem título'}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-current" />}
                    {note.priority === 'urgent' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                  </div>
                </div>
                
                <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                  {note.content.replace(/<[^>]*>/g, '') || 'Sem conteúdo...'}
                </p>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  <span>{format(note.updatedAt, "dd MMM", { locale: ptBR })}</span>
                  {note.type === 'checklist' && (
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {note.checklistItems?.filter(i => i.isCompleted).length}/{note.checklistItems?.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}