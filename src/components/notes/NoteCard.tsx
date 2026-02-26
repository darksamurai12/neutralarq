"use client";

import { Note, NoteColor, NoteType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, Trash2, MoreHorizontal, Pencil, ExternalLink, AlertCircle, Archive, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
  onToggleImportant: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
  viewMode?: 'grid' | 'list';
}

const typeConfig: Record<NoteType, { label: string; icon: string; color: string }> = {
  office: { label: 'Escritório', icon: '🏢', color: 'text-blue-600 bg-blue-50' },
  procedure: { label: 'Procedimento', icon: '📜', color: 'text-purple-600 bg-purple-50' },
  meeting: { label: 'Reunião', icon: '🤝', color: 'text-emerald-600 bg-emerald-50' },
  idea: { label: 'Ideia', icon: '💡', color: 'text-amber-600 bg-amber-50' },
  reminder: { label: 'Lembrete', icon: '🔔', color: 'text-rose-600 bg-rose-50' },
  personal: { label: 'Pessoal', icon: '👤', color: 'text-slate-600 bg-slate-50' },
};

export function NoteCard({ note, onDelete, onTogglePin, onToggleImportant, onToggleArchive, viewMode = 'grid' }: NoteCardProps) {
  const navigate = useNavigate();
  const type = typeConfig[note.type];

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => navigate(`/notas/${note.id}`)}
      >
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-lg", type.color)}>
          {type.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 dark:text-white truncate">{note.title}</h3>
            {note.isImportant && <AlertCircle className="w-3.5 h-3.5 text-rose-500 fill-current" />}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase font-bold mt-0.5">
            <span>{type.label}</span>
            <span>•</span>
            <span>{format(note.updatedAt, "dd/MM/yyyy")}</span>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg", note.isPinned && "text-primary")} onClick={() => onTogglePin(note)}>
            <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/notas/${note.id}`)}><Pencil className="w-4 h-4 mr-2" />Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleArchive(note)}><Archive className="w-4 h-4 mr-2" />{note.isArchived ? 'Desarquivar' : 'Arquivar'}</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(note.id)}><Trash2 className="w-4 h-4 mr-2" />Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-glass border-2 cursor-pointer rounded-3xl",
        note.isPinned ? "border-primary/20 ring-1 ring-primary/10" : "border-transparent bg-white dark:bg-slate-800",
        note.isImportant && "border-rose-200"
      )}
      onClick={() => navigate(`/notas/${note.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5", type.color)}>
            <span>{type.icon}</span>
            {type.label}
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-xl transition-colors", note.isPinned ? "text-primary bg-primary/5" : "text-slate-300 opacity-0 group-hover:opacity-100")}
              onClick={() => onTogglePin(note)}
            >
              <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-xl transition-colors", note.isImportant ? "text-rose-500 bg-rose-50" : "text-slate-300 opacity-0 group-hover:opacity-100")}
              onClick={() => onToggleImportant(note)}
            >
              <AlertCircle className={cn("w-4 h-4", note.isImportant && "fill-current")} />
            </Button>
          </div>
        </div>

        <h3 className="font-black text-slate-800 dark:text-white text-lg leading-tight mb-2 line-clamp-2">
          {note.title}
        </h3>

        <div 
          className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {note.authorName || 'Escritório'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-300">
            {format(note.updatedAt, "dd MMM", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}