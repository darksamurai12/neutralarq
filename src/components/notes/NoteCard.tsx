"use client";

import { Note, NoteColor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, Trash2, MoreHorizontal, Pencil, Archive, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, current: boolean) => void;
  onToggleArchive: (id: string, current: boolean) => void;
}

const colorClasses: Record<NoteColor, string> = {
  default: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
  blue: 'bg-pastel-sky border-blue-200 dark:bg-blue-950/30',
  green: 'bg-pastel-mint border-emerald-200 dark:bg-emerald-950/30',
  yellow: 'bg-pastel-amber border-amber-200 dark:bg-amber-950/30',
  purple: 'bg-pastel-lavender border-primary/20 dark:bg-primary/20',
  rose: 'bg-pastel-rose border-rose-200 dark:bg-rose-950/30',
};

export function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleArchive }: NoteCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-glass border-2 cursor-pointer rounded-2xl",
        colorClasses[note.color],
        note.isPinned ? "ring-2 ring-primary/20" : ""
      )}
      onClick={() => onEdit(note)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight line-clamp-2">
            {note.title || 'Sem título'}
          </h3>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-xl transition-colors",
                note.isPinned ? "text-primary bg-primary/10" : "text-slate-400 opacity-0 group-hover:opacity-100"
              )}
              onClick={() => onTogglePin(note.id, note.isPinned)}
            >
              <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
            </Button>
          </div>
        </div>

        <div 
          className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 mb-4 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 rounded-lg bg-black/5 dark:bg-white/5 border-none">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5 dark:border-white/5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {format(note.updatedAt, "dd MMM", { locale: ptBR })}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleArchive(note.id, note.isArchived)}>
                  <Archive className="w-4 h-4 mr-2" /> {note.isArchived ? 'Desarquivar' : 'Arquivar'}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(note.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}