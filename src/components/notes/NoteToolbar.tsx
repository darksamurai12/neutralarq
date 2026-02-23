"use client";

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading1, Heading2, Type,
  Highlighter, Eraser, ChevronDown, Baseline
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NoteToolbarProps {
  editor: Editor | null;
}

export function NoteToolbar({ editor }: NoteToolbarProps) {
  if (!editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    className = "" 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    className?: string;
  }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "h-8 w-8 rounded-md transition-colors",
        isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100",
        className
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex flex-col border-b border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-20">
      <div className="flex flex-wrap items-center gap-1 p-1.5">
        
        {/* Secção: Tipo de Letra */}
        <div className="flex flex-col items-center px-2 border-r border-slate-200">
          <div className="flex items-center gap-0.5">
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
            >
              <Underline className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')}>
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()}>
              <Eraser className="w-4 h-4" />
            </ToolbarButton>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Tipo de Letra</span>
        </div>

        {/* Secção: Parágrafo */}
        <div className="flex flex-col items-center px-2 border-r border-slate-200">
          <div className="flex items-center gap-0.5">
            <ToolbarButton 
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
            >
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Parágrafo</span>
        </div>

        {/* Secção: Estilos */}
        <div className="flex flex-col items-center px-2">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-medium border-slate-200">
                  {editor.isActive('heading', { level: 1 }) ? 'Título 1' : 
                   editor.isActive('heading', { level: 2 }) ? 'Título 2' : 'Normal'}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                  <Type className="w-4 h-4 mr-2" /> Normal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                  <Heading1 className="w-4 h-4 mr-2" /> Título 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                  <Heading2 className="w-4 h-4 mr-2" /> Título 2
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Estilos</span>
        </div>

      </div>
    </div>
  );
}