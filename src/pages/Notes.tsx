"use client";

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { NoteSidebar } from '@/components/notes/NoteSidebar';
import { NoteListColumn } from '@/components/notes/NoteListColumn';
import { NoteDetailColumn } from '@/components/notes/NoteDetailColumn';
import { Note, NotePriority } from '@/types';
import { isToday, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

export default function Notes() {
  const { user } = useAuth();
  const { addTask } = useApp();
  const { 
    notes, lists, loading, 
    addNote, updateNote, deleteNote, 
    addChecklistItem, toggleChecklistItem, deleteChecklistItem,
    addList 
  } = useNotes(user?.id);

  const [activeFilter, setActiveFilter] = useState('inbox');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Filtro de Pesquisa
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filtro de Arquivo
      if (activeFilter === 'archived') return note.isArchived;
      if (note.isArchived) return false;

      // Filtros Inteligentes
      if (activeFilter === 'inbox') return !note.listId;
      if (activeFilter === 'pinned') return note.isPinned;
      if (activeFilter === 'today') {
        return note.reminderDate && isToday(note.reminderDate);
      }
      if (activeFilter === 'next7') {
        const start = startOfDay(new Date());
        const end = endOfDay(addDays(new Date(), 7));
        return note.reminderDate && isWithinInterval(note.reminderDate, { start, end });
      }

      // Filtro por Lista
      return note.listId === activeFilter;
    });
  }, [notes, activeFilter, searchQuery]);

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  const handleQuickAdd = async (title: string) => {
    const listId = lists.find(l => l.id === activeFilter) ? activeFilter : null;
    const id = await addNote({ 
      title, 
      listId,
      priority: 'medium',
      type: 'text'
    });
    if (id) setSelectedNoteId(id);
  };

  const handleConvertToTask = async (note: Note) => {
    await addTask({
      title: note.title,
      description: note.content,
      type: 'internal',
      responsible: user?.email?.split('@')[0] || 'Eu',
      priority: note.priority as any,
      status: 'pending',
      startDate: new Date(),
      deadline: note.reminderDate || addDays(new Date(), 1),
      completionPercentage: 0,
      subtasks: note.checklistItems?.map(i => ({ title: i.description, completed: i.isCompleted })) || [],
      comments: []
    });
    await deleteNote(note.id);
    setSelectedNoteId(null);
    toast.success('Nota convertida em tarefa com sucesso!');
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-120px)] -m-8 overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 shadow-glass bg-white dark:bg-slate-900">
        {/* Coluna 1: Sidebar */}
        <NoteSidebar 
          lists={lists} 
          activeFilter={activeFilter} 
          onFilterChange={(f) => { setActiveFilter(f); setSelectedNoteId(null); }}
          onAddList={() => {
            const name = prompt('Nome da nova lista:');
            if (name) addList(name, '#3b82f6', 'hash');
          }}
        />

        {/* Coluna 2: Lista de Notas */}
        <NoteListColumn 
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onQuickAdd={handleQuickAdd}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Coluna 3: Editor */}
        <NoteDetailColumn 
          note={selectedNote}
          lists={lists}
          onUpdate={updateNote}
          onDelete={(id) => { deleteNote(id); setSelectedNoteId(null); }}
          onAddChecklistItem={addChecklistItem}
          onToggleChecklistItem={toggleChecklistItem}
          onDeleteChecklistItem={deleteChecklistItem}
          onConvertToTask={handleConvertToTask}
        />
      </div>
    </AppLayout>
  );
}