"use client";

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NoteColor, NoteType } from '@/types';
import { ArrowLeft, Save, Trash2, Pin, Loader2, Star, Archive, Calendar as CalendarIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoteColorPicker } from '@/components/notes/NoteColorPicker';
import { RichTextEditor } from '@/components/notes/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote, deleteNote, loading } = useApp();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [type, setType] = useState<NoteType>('office');
  const [category, setCategory] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isNew = id === 'nova';

  useEffect(() => {
    if (!isNew && notes.length > 0) {
      const note = notes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setColor(note.color);
        setType(note.type);
        setCategory(note.category || '');
        setIsPinned(note.isPinned);
        setIsImportant(note.isImportant);
        setIsArchived(note.isArchived);
        setReminderDate(note.reminderDate || null);
        setAuthorName(note.authorName || '');
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
    const noteData = { 
      title, content, color, type, category, 
      isPinned, isImportant, isArchived, 
      reminderDate, authorName, attachments: [] 
    };

    try {
      if (isNew) {
        await addNote(noteData);
      } else if (id) {
        await updateNote(id, noteData);
      }
      navigate('/notas');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Toolbar Superior */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/notas')}
            className="h-12 w-12 rounded-2xl hover:bg-white shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-[1.5rem] shadow-glass border border-slate-100 dark:border-slate-700">
            <NoteColorPicker currentColor={color} onColorSelect={setColor} />
            
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 rounded-xl transition-colors", isPinned && "text-primary bg-primary/5")}
              onClick={() => setIsPinned(!isPinned)}
              title="Fixar no topo"
            >
              <Pin className={cn("w-5 h-5", isPinned && "fill-current")} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 rounded-xl transition-colors", isImportant && "text-rose-500 bg-rose-50")}
              onClick={() => setIsImportant(!isImportant)}
              title="Marcar como importante"
            >
              <Star className={cn("w-5 h-5", isImportant && "fill-current")} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 rounded-xl transition-colors", isArchived && "text-slate-600 bg-slate-100")}
              onClick={() => setIsArchived(!isArchived)}
              title="Arquivar nota"
            >
              <Archive className="w-5 h-5" />
            </Button>

            <div className="w-px h-6 bg-slate-100 dark:bg-slate-700 mx-1" />

            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="rounded-2xl px-8 h-11 shadow-lg shadow-primary/20 font-bold"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Nota
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Metadados */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2rem] border-none shadow-glass p-6 bg-white dark:bg-slate-800">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Configurações</h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Tipo de Nota</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">🏢 Interna Escritório</SelectItem>
                      <SelectItem value="procedure">📜 Procedimento</SelectItem>
                      <SelectItem value="meeting">🤝 Reunião</SelectItem>
                      <SelectItem value="idea">💡 Ideia</SelectItem>
                      <SelectItem value="reminder">🔔 Lembrete</SelectItem>
                      <SelectItem value="personal">👤 Pessoal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Categoria / Tag</Label>
                  <Input 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ex: Financeiro, RH..."
                    className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Autor</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      value={authorName} 
                      onChange={e => setAuthorName(e.target.value)}
                      placeholder="Nome do autor"
                      className="rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-11 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Lembrete</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl bg-slate-50 dark:bg-slate-900 border-none h-11">
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                        {reminderDate ? format(reminderDate, "PPP", { locale: ptBR }) : <span>Definir data...</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-none">
                      <Calendar mode="single" selected={reminderDate || undefined} onSelect={date => setReminderDate(date || null)} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </Card>

            {!isNew && (
              <Button 
                variant="ghost" 
                className="w-full rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 h-12 font-bold"
                onClick={() => { if(confirm('Eliminar esta nota permanentemente?')) { deleteNote(id!); navigate('/notas'); } }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Nota
              </Button>
            )}
          </div>

          {/* Área do Editor */}
          <div className="lg:col-span-3 space-y-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da nota ou procedimento..."
              className="text-3xl md:text-4xl font-black border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto placeholder:opacity-20"
              autoFocus
            />
            
            <RichTextEditor 
              content={content} 
              onChange={setContent} 
              placeholder="Comece a documentar o conhecimento aqui..."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}