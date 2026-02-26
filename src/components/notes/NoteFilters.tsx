"use client";

import { Search, Filter, LayoutGrid, List, SortAsc, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NoteType } from '@/types';
import { cn } from '@/lib/utils';

interface NoteFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  typeFilter: NoteType | 'all';
  onTypeChange: (val: NoteType | 'all') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
}

export function NoteFilters({
  searchQuery, onSearchChange,
  typeFilter, onTypeChange,
  viewMode, onViewModeChange,
  sortBy, onSortChange,
  showArchived, onToggleArchived
}: NoteFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar no conhecimento do escritório..."
            className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(v: any) => onTypeChange(v)}>
            <SelectTrigger className="w-[180px] h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm">
              <SelectValue placeholder="Tipo de Nota" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="office">🏢 Interna Escritório</SelectItem>
              <SelectItem value="procedure">📜 Procedimento</SelectItem>
              <SelectItem value="meeting">🤝 Reunião</SelectItem>
              <SelectItem value="idea">💡 Ideia</SelectItem>
              <SelectItem value="reminder">🔔 Lembrete</SelectItem>
              <SelectItem value="personal">👤 Pessoal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px] h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm">
              <SortAsc className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
              <SelectItem value="updated">Última Atualização</SelectItem>
              <SelectItem value="created">Data de Criação</SelectItem>
              <SelectItem value="title">Título (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn("rounded-xl gap-2", showArchived && "text-primary bg-primary/5")}
            onClick={onToggleArchived}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? "Ver Ativas" : "Ver Arquivadas"}
          </Button>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-lg", viewMode === 'grid' && "bg-white dark:bg-slate-700 shadow-sm")}
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-lg", viewMode === 'list' && "bg-white dark:bg-slate-700 shadow-sm")}
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}