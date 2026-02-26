"use client";

import { NoteList, Note } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CalendarDays, 
  Pin, 
  Archive, 
  Plus, 
  Hash, 
  Inbox,
  Star,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteSidebarProps {
  lists: NoteList[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onAddList: () => void;
}

export function NoteSidebar({ lists, activeFilter, onFilterChange, onAddList }: NoteSidebarProps) {
  const filters = [
    { id: 'inbox', label: 'Entrada', icon: Inbox, color: 'text-blue-500' },
    { id: 'today', label: 'Hoje', icon: Calendar, color: 'text-emerald-500' },
    { id: 'next7', label: 'Próximos 7 dias', icon: CalendarDays, color: 'text-purple-500' },
    { id: 'pinned', label: 'Fixadas', icon: Pin, color: 'text-amber-500' },
  ];

  return (
    <div className="w-64 flex flex-col border-r border-slate-100 dark:border-slate-800 h-full bg-slate-50/50 dark:bg-slate-900/50">
      <div className="p-4 space-y-1">
        <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filtros</p>
        {filters.map(f => (
          <Button
            key={f.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 rounded-xl h-10 font-medium text-slate-600 dark:text-slate-400",
              activeFilter === f.id && "bg-white dark:bg-slate-800 text-primary shadow-sm"
            )}
            onClick={() => onFilterChange(f.id)}
          >
            <f.icon className={cn("w-4 h-4", f.color)} />
            {f.label}
          </Button>
        ))}
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Listas</p>
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-md" onClick={onAddList}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-1">
          {lists.map(list => (
            <Button
              key={list.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 rounded-xl h-10 font-medium text-slate-600 dark:text-slate-400",
                activeFilter === list.id && "bg-white dark:bg-slate-800 text-primary shadow-sm"
              )}
              onClick={() => onFilterChange(list.id)}
            >
              <Circle className="w-3 h-3 fill-current" style={{ color: list.color }} />
              <span className="truncate">{list.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-xl h-10 font-medium text-slate-400",
            activeFilter === 'archived' && "bg-white dark:bg-slate-800 text-primary shadow-sm"
          )}
          onClick={() => onFilterChange('archived')}
        >
          <Archive className="w-4 h-4" />
          Arquivadas
        </Button>
      </div>
    </div>
  );
}