"use client";

import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';
import { StickyNote, Plus, Search, Filter, Archive, Trash2, Pin, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteDialog } from '@/components/notes/NoteDialog';
import { Note } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Notes() {
  const { user } = useAuth();
  const { notes, loading, fetchNotes, addNote, updateNote, deleteNote } = useNotes(user?.id);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user, fetchNotes]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !activeTag || note.tags.includes(activeTag);
      const matchesArchive = note.isArchived === showArchived;
      return matchesSearch && matchesTag && matchesArchive;
    });
  }, [notes, searchQuery, activeTag, showArchived]);

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  const handleCreate = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingNote) {
      updateNote(editingNote.id, data);
    } else {
      addNote(data);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Notas e Ideias"
        description="Organize os seus pensamentos, procedimentos e checklists"
        icon={StickyNote}
      >
        <Button 
          className="gap-2 shadow-lg rounded-2xl h-12 px-6 font-bold"
          onClick={handleCreate}
        >
          <Plus className="w-5 h-5" /> Criar Nota
        </Button>
      </PageHeader>

      {/* Filtros e Tags */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar nas suas notas..."
            className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <Button
            variant={showArchived ? "secondary" : "ghost"}
            size="sm"
            className="rounded-xl gap-2 h-10"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? "Ver Ativas" : "Ver Arquivo"}
          </Button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
          
          <Badge 
            variant={!activeTag ? "default" : "outline"}
            className="cursor-pointer px-3 py-1.5 rounded-xl"
            onClick={() => setActiveTag(null)}
          >
            Todas
          </Badge>
          {allTags.map(tag => (
            <Badge 
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 rounded-xl"
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid de Notas */}
      <div className="space-y-10">
        {pinnedNotes.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fixadas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pinnedNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onEdit={handleEdit}
                  onDelete={deleteNote}
                  onTogglePin={(id, curr) => updateNote(id, { isPinned: !curr })}
                  onToggleArchive={(id, curr) => updateNote(id, { isArchived: !curr })}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {pinnedNotes.length > 0 && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Outras</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {otherNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onEdit={handleEdit}
                onDelete={deleteNote}
                onTogglePin={(id, curr) => updateNote(id, { isPinned: !curr })}
                onToggleArchive={(id, curr) => updateNote(id, { isArchived: !curr })}
              />
            ))}
            
            {filteredNotes.length === 0 && !loading && (
              <div className="col-span-full py-32 text-center bg-white dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <StickyNote className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-black text-xl">Nenhuma nota encontrada</p>
                <p className="text-sm text-slate-300 mt-2">Clique em "Criar Nota" para começar a organizar as suas ideias.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <NoteDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingNote={editingNote}
        onSubmit={handleFormSubmit}
        onDelete={deleteNote}
      />
    </AppLayout>
  );
}