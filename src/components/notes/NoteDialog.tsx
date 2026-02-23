"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Note, NoteColor } from '@/types';
import { Pin, Trash2, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote: Note | null;
  onSubmit: (data: any) => void;
  onDelete?: (id: string) => void;
}

const colors: { name: NoteColor; class: string }[] = [
  { name: 'default', class: 'bg-white border-slate-200' },
  { name: 'blue', class: 'bg-pastel-sky border-blue-200' },
  { name: 'green', class: 'bg-pastel-mint border-emerald-200' },
  { name: 'yellow', class: 'bg-pastel-amber border-amber-200' },
  { name: 'purple', class: 'bg-pastel-lavender border-primary/20' },
  { name: 'rose', class: 'bg-pastel-rose border-rose-200' },
];

export function NoteDialog({ open, onOpenChange, editingNote, onSubmit, onDelete }: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setColor(editingNote.color);
      setIsPinned(editingNote.isPinned);
    } else {
      setTitle('');
      setContent('');
      setColor('default');
      setIsPinned(false);
    }
  }, [editingNote, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, content, color, isPinned });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-xl transition-colors duration-300 border-none shadow-2xl",
        color === 'default' ? 'bg-white dark:bg-slate-900' : 
        color === 'blue' ? 'bg-[#E7F5FF]' :
        color === 'green' ? 'bg-[#EBFBEE]' :
        color === 'yellow' ? 'bg-[#FFF9DB]' :
        color === 'purple' ? 'bg-[#F3F0FF]' :
        'bg-[#FFF0F6]'
      )}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">
            {editingNote ? 'Editar Nota' : 'Nova Nota'}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9 rounded-xl", isPinned && "text-primary bg-primary/10")}
              onClick={() => setIsPinned(!isPinned)}
            >
              <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da nota..."
            className="text-lg font-bold border-none bg-transparent shadow-none focus-visible:ring-0 px-0"
            required
          />
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva algo..."
            className="min-h-[200px] border-none bg-transparent shadow-none focus-visible:ring-0 px-0 resize-none text-slate-700 dark:text-slate-300"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between pt-4 border-t border-black/5">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                    <Palette className="w-4 h-4 text-slate-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={cn(
                          "h-8 w-8 rounded-full border flex items-center justify-center transition-transform hover:scale-110",
                          c.class
                        )}
                        onClick={() => setColor(c.name)}
                      >
                        {color === c.name && <Check className="w-3 h-3 text-slate-600" />}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {editingNote && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50"
                  onClick={() => { onDelete(editingNote.id); onOpenChange(false); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl px-6">
                {editingNote ? 'Guardar' : 'Criar Nota'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}