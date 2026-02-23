"use client";

import { Note, NoteColor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, Trash2, MoreHorizontal, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
}

const colorClasses: Record<NoteColor, string> = {
  default: 'bg-white dark:bg-slate-800 border-slate-200',
  blue: 'bg-pastel-sky border-blue-200',
  green: 'bg-pastel-mint border-emerald-200',
  yellow: 'bg-pastel-amber border-amber-200',
  purple: 'bg-pastel-lavender border-primary/20',
  rose: 'bg-pastel-rose border-rose-200',
};

export function NoteCard({ note, onEdit, onDelete, onTogglePin }: NoteCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-md border-2",
        colorClasses[note.color],
        note.isPinned && "ring-2 ring-primary/20"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 flex-1">
            {note.title}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg transition-colors",
                note.isPinned ? "text-primary" : "text-slate-400 opacity-0 group-hover:opacity-100"
              )}
              onClick={() => onTogglePin(note)}
            >
              <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(note.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4 mb-4 whitespace-pre-wrap">
          {note.content}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            {format(note.updatedAt, "d 'de' MMM", { locale: ptBR })}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] font-bold text-primary hover:bg-primary/5"
            onClick={() => onEdit(note)}
          >
            ABRIR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}