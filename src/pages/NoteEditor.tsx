"use client";

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoteColor } from '@/types';
import { ArrowLeft, Save, Trash2, Pin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoteColorPicker } from '@/components/notes/NoteColorPicker';
import { RichTextEditor } from '@/components/notes/RichTextEditor';
import { toast } from 'sonner';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote, loading } = useApp();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isNew = id === 'nova';

  useEffect(() => {
    if (!isNew && notes.length > 0) {
      const note = notes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setColor(note.color);
        setIsPinned(note.isPinned);
      } else if (!loading) {
        toast.error('Nota não encontrada');
        navigate('/notas');
      }
    }
  }, [id, notes, isNew, loading, navigate]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('A nota precisa de um título');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        await addNote({ title, content, color, isPinned });
      } else if (id) {
        await updateNote(id, { title, content, color, isPinned });
      }
      navigate('/notas');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || isNew) return;
    if (confirm('Tem a certeza que deseja eliminar esta nota?')) {
      await deleteNote(id);
      navigate('/notas');
    }
  };

  const bgColorClass = {
    default: 'bg-white dark:bg-slate-900',
    blue: 'bg-[#E7F5FF] dark:bg-[#081e2d]',
    green: 'bg-[#EBFBEE] dark:bg-[#062016]',
    yellow: 'bg-[#FFF9DB] dark:bg-[#2d2305]',
    purple: 'bg-[#F3F0FF] dark:bg-[#1e1b4b]',
    rose: 'bg-[#FFF0F6] dark:bg-[#2d101b]',
  }[color];

  return (
    <AppLayout>
      <div className={cn(
        "min-h-[calc(100vh-8rem)] rounded-3xl transition-colors duration-500 p-4 md:p-6 shadow-sm border border-black/5",
        bgColorClass
      )}>
        {/* Header / Toolbar Superior */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/notas')}
            className="h-10 w-10 rounded-xl hover:bg-black/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-sm">
            <NoteColorPicker currentColor={color} onColorSelect={setColor} />
            
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 rounded-xl transition-colors", isPinned && "text-primary bg-primary/10")}
              onClick={() => setIsPinned(!isPinned)}
            >
              <Pin className={cn("w-5 h-5", isPinned && "fill-current")} />
            </Button>

            {!isNew && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}

            <div className="w-px h-6 bg-black/10 mx-1" />

            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="rounded-xl px-6 h-10 shadow-lg shadow-primary/20"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="max-w-5xl mx-auto space-y-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da nota..."
            className="text-3xl md:text-4xl font-black border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto placeholder:opacity-30"
            autoFocus
          />
          
          <RichTextEditor 
            content={content} 
            onChange={setContent} 
            placeholder="Comece a escrever as suas ideias aqui..."
          />
        </div>
      </div>
    </AppLayout>
  );
}