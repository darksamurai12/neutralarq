"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { StickyNote, Plus, Search, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoteCard } from '@/components/notes/NoteCard';
import { Note } from '@/types';

export default function Notes() {
  const { notes, updateNote, deleteNote } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleTogglePin = (note: Note) => {
    updateNote(note.id, { isPinned: !note.isPinned });
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <AppLayout>
      <PageHeader
        title="Notas"
        description="Anotações rápidas e lembretes"
        icon={StickyNote}
      >
        <Button 
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          onClick={() => navigate('/notas/nova')}
        >
          <Plus className="w-4 h-4" />
          Nova Nota
        </Button>
      </PageHeader>

      <div className="max-w-md mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar notas..."
            className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-10">
        {pinnedNotes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Pin className="w-3.5 h-3.5 text-primary fill-current" />
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixadas</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onDelete={deleteNote}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          {pinnedNotes.length > 0 && (
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Outras</h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onDelete={deleteNote}
                onTogglePin={handleTogglePin}
              />
            ))}
            {filteredNotes.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <StickyNote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Nenhuma nota encontrada</p>
                <p className="text-sm text-slate-400 mt-1">Crie uma nova nota para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}