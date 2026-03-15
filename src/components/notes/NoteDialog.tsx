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
import { Note, NoteColor, NoteType } from '@/types';
import { Pin, Trash2, Palette, Check, Tag, Archive, ListChecks, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RichTextEditor } from './RichTextEditor';
import { Badge } from '@/components/ui/badge';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote: Note | null;
  onSubmit: (data: any) => void;
  onDelete?: (id: string) => void;
}

const colors: { name: NoteColor; class: string; hex: string }[] = [
  { name: 'default', class: 'bg-white border-slate-200', hex: '#ffffff' },
  { name: 'blue', class: 'bg-pastel-sky border-blue-200', hex: '#E7F5FF' },
  { name: 'green', class: 'bg-pastel-mint border-emerald-200', hex: '#EBFBEE' },
  { name: 'yellow', class: 'bg-pastel-amber border-amber-200', hex: '#FFF9DB' },
  { name: 'purple', class: 'bg-pastel-lavender border-primary/20', hex: '#F3F0FF' },
  { name: 'rose', class: 'bg-pastel-rose border-rose-200', hex: '#FFF0F6' },
];

export function NoteDialog({ open, onOpenChange, editingNote, onSubmit, onDelete }: NoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [type, setType] = useState<NoteType>('text');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setColor(editingNote.color);
      setIsPinned(editingNote.isPinned);
      setIsArchived(editingNote.isArchived);
      setType(editingNote.type);
      setTags(editingNote.tags || []);
    } else {
      setTitle('');
      setContent('');
      setColor('default');
      setIsPinned(false);
      setIsArchived(false);
      setType('text');
      setTags([]);
    }
  }, [editingNote, open]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() && !content.trim()) return;
    onSubmit({ title, content, color, isPinned, isArchived, type, tags });
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const currentColorHex = colors.find(c => c.name === color)?.hex || '#ffffff';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0"
        style={{ backgroundColor: currentColorHex }}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="text-2xl font-bold border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto placeholder:opacity-50"
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 rounded-xl", isPinned && "text-primary bg-primary/10")}
              onClick={() => setIsPinned(!isPinned)}
            >
              <Pin className={cn("w-5 h-5", isPinned && "fill-current")} />
            </Button>
          </div>

          <div className="min-h-[300px]">
            <RichTextEditor 
              content={content} 
              onChange={setContent} 
              placeholder="Escreva uma nota..."
            />
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1 rounded-lg bg-black/5 border-none">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
          )}

          {/* Toolbar Inferior */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-black/5">
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-black/5">
                    <Palette className="w-4 h-4 text-slate-600" />
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-black/5">
                    <Tag className="w-4 h-4 text-slate-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase text-slate-400">Etiquetas</p>
                    <div className="flex gap-2">
                      <Input 
                        value={newTag} 
                        onChange={e => setNewTag(e.target.value)}
                        placeholder="Nova etiqueta..."
                        className="h-8 text-xs"
                        onKeyDown={e => e.key === 'Enter' && addTag()}
                      />
                      <Button size="sm" className="h-8" onClick={addTag}>Add</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-9 w-9 rounded-xl hover:bg-black/5", isArchived && "text-primary")}
                onClick={() => setIsArchived(!isArchived)}
                title="Arquivar"
              >
                <Archive className="w-4 h-4" />
              </Button>

              {editingNote && onDelete && (
                <Button
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
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button onClick={() => handleSubmit()} className="rounded-xl px-8 font-bold">
                Concluído
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}