"use client";

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  CheckSquare, Link as LinkIcon, Image as ImageIcon,
  Type, Highlighter, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NoteToolbarProps {
  editor: Editor | null;
}

export function NoteToolbar({ editor }: NoteToolbarProps) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL do link:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const ToolbarButton = ({ onClick, isActive = false, children, title }: any) => (
    <Button
      variant="ghost"
      size="icon"
      title={title}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "h-8 w-8 rounded-md transition-colors",
        isActive ? "bg-black/10 text-primary" : "text-slate-600 hover:bg-black/5"
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-black/5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Negrito"><Bold className="w-4 h-4" /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Itálico"><Italic className="w-4 h-4" /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Sublinhado"><Underline className="w-4 h-4" /></ToolbarButton>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Lista"><List className="w-4 h-4" /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Lista Numerada"><ListOrdered className="w-4 h-4" /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Checklist"><CheckSquare className="w-4 h-4" /></ToolbarButton>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Inserir Link"><LinkIcon className="w-4 h-4" /></ToolbarButton>
      <ToolbarButton onClick={addImage} title="Inserir Imagem"><ImageIcon className="w-4 h-4" /></ToolbarButton>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Realçar"><Highlighter className="w-4 h-4" /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Esquerda"><AlignLeft className="w-4 h-4" /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centro"><AlignCenter className="w-4 h-4" /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Direita"><AlignRight className="w-4 h-4" /></ToolbarButton>
    </div>
  );
}