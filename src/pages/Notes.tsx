"use client";

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { StickyNote, Plus, BookOpen, Star, Archive as ArchiveIcon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteFilters } from '@/components/notes/NoteFilters';
import { Note, NoteType } from '@/types';

export default function Notes() {
  const { notes, updateNote, deleteNote } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<NoteType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('updated');
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  const metrics = useMemo(() => ({
    total: notes.filter(n => !n.isArchived).length,
    important: notes.filter(n => n.isImportant && !n.isArchived).length,
    procedures: notes.filter(n => n.type === 'procedure' && !n.isArchived).length,
    archived: notes.filter(n => n.isArchived).length,
  }), [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || note.type === typeFilter;
        const matchesArchive = note.isArchived === showArchived;
        return matchesSearch && matchesType && matchesArchive;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'created') return b.createdAt.getTime() - a.createdAt.getTime();
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
  }, [notes, searchQuery, typeFilter, showArchived, sortBy]);

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <AppLayout>
      <PageHeader
        title="Gestão de Conhecimento"
        description="Repositório central de procedimentos, ideias e registos do escritório"
        icon={StickyNote}
      >
        <Button 
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-12 px-6"
          onClick={() => navigate('/notas/nova')}
        >
          <Plus className="w-5 h-5" />
          Nova Nota
        </Button>
      </PageHeader>

      {/* Dashboard de Notas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-pastel-sky p-5 rounded-3xl border border-blue-100/50">
          <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest">Total Ativas</p>
          <p className="text-2xl font-black text-slate-800">{metrics.total}</p>
        </div>
        <div className="bg-pastel-rose p-5 rounded-3xl border border-rose-100/50">
          <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-3">
            <Star className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest">Importantes</p>
          <p className="text-2xl font-black text-slate-800">{metrics.important}</p>
        </div>
        <div className="bg-pastel-lavender p-5 rounded-3xl border border-primary/10">
          <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Procedimentos</p>
          <p className="text-2xl font-black text-slate-800">{metrics.procedures}</p>
        </div>
        <div className="bg-pastel-slate p-5 rounded-3xl border border-slate-200">
          <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-3">
            <ArchiveIcon className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arquivadas</p>
          <p className="text-2xl font-black text-slate-800">{metrics.archived}</p>
        </div>
      </div>

      <NoteFilters
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
        typeFilter={typeFilter} onTypeChange={setTypeFilter}
        viewMode={viewMode} onViewModeChange={setViewMode}
        sortBy={sortBy} onSortChange={setSortBy}
        showArchived={showArchived} onToggleArchived={() => setShowArchived(!showArchived)}
      />

      <div className="space-y-10">
        {pinnedNotes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Pin className="w-3.5 h-3.5 text-primary fill-current" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas Fixadas</h2>
            </div>
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "flex flex-col gap-3"
            )}>
              {pinnedNotes.map(note => (
                <NoteCard 
                  key={note.id} note={note} viewMode={viewMode}
                  onDelete={deleteNote}
                  onTogglePin={n => updateNote(n.id, { isPinned: !n.isPinned })}
                  onToggleImportant={n => updateNote(n.id, { isImportant: !n.isImportant })}
                  onToggleArchive={n => updateNote(n.id, { isArchived: !n.isArchived })}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          {pinnedNotes.length > 0 && (
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Outras Notas</h2>
          )}
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "flex flex-col gap-3"
          )}>
            {otherNotes.map(note => (
              <NoteCard 
                key={note.id} note={note} viewMode={viewMode}
                onDelete={deleteNote}
                onTogglePin={n => updateNote(n.id, { isPinned: !n.isPinned })}
                onToggleImportant={n => updateNote(n.id, { isImportant: !n.isImportant })}
                onToggleArchive={n => updateNote(n.id, { isArchived: !n.isArchived })}
              />
            ))}
            {filteredNotes.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="h-20 w-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                  <StickyNote className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-500 font-black text-xl">Nenhuma nota encontrada</p>
                <p className="text-sm text-slate-400 mt-2">Tente ajustar os filtros ou crie uma nova nota.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}