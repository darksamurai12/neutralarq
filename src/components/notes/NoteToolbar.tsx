"use client";

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Highlighter, Eraser, 
  Table as TableIcon, Plus, Trash2, CheckSquare, 
  Network, Indent, Outdent
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
    className = "",
    disabled = false,
    title = ""
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    title?: string;
  }) => (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      title={title}
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
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Negrito"><Bold className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Itálico"><Italic className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Sublinhado"><Underline className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Riscado"><Strikethrough className="w-4 h-4" /></ToolbarButton>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Realçar"><Highlighter className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Limpar Formatação"><Eraser className="w-4 h-4" /></ToolbarButton>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Tipo de Letra</span>
        </div>

        {/* Secção: Parágrafo e Listas */}
        <div className="flex flex-col items-center px-2 border-r border-slate-200">
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Lista Simples"><List className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Lista Numerada"><ListOrdered className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Lista de Tarefas"><CheckSquare className="w-4 h-4" /></ToolbarButton>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ToolbarButton 
              onClick={() => editor.chain().focus().liftListItem('taskItem').liftListItem('listItem').run()} 
              disabled={!editor.can().liftListItem('taskItem') && !editor.can().liftListItem('listItem')}
              title="Diminuir Recuo"
            >
              <Outdent className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().sinkListItem('taskItem').sinkListItem('listItem').run()} 
              disabled={!editor.can().sinkListItem('taskItem') && !editor.can().sinkListItem('listItem')}
              title="Aumentar Recuo"
            >
              <Indent className="w-4 h-4" />
            </ToolbarButton>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Parágrafo</span>
        </div>

        {/* Secção: Alinhamento */}
        <div className="flex flex-col items-center px-2 border-r border-slate-200">
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Alinhar à Esquerda"><AlignLeft className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centrar"><AlignCenter className="w-4 h-4" /></ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Alinhar à Direita"><AlignRight className="w-4 h-4" /></ToolbarButton>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Alinhamento</span>
        </div>

        {/* Secção: Tabela */}
        <div className="flex flex-col items-center px-2 border-r border-slate-200">
          <div className="flex items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-md" title="Tabela">
                  <TableIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                  <Plus className="w-4 h-4 mr-2" /> Inserir Tabela
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.isActive('table')}>
                  Adicionar Coluna Antes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.isActive('table')}>
                  Adicionar Coluna Depois
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.isActive('table')} className="text-rose-500">
                  Eliminar Coluna
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.isActive('table')}>
                  Adicionar Linha Antes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.isActive('table')}>
                  Adicionar Linha Depois
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.isActive('table')} className="text-rose-500">
                  Eliminar Linha
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.isActive('table')} className="text-rose-500 font-bold">
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar Tabela
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Tabela</span>
        </div>

        {/* Secção: Mapa Mental */}
        <div className="flex flex-col items-center px-2">
          <div className="flex items-center gap-0.5">
            <ToolbarButton 
              title="Iniciar Estrutura de Mapa Mental"
              onClick={() => {
                editor.chain().focus()
                  .insertContent('<h1>Ideia Central</h1><ul data-type="taskList"><li data-checked="false"><div>Tópico Principal 1</div></li><li data-checked="false"><div>Tópico Principal 2</div></li></ul>')
                  .run();
              }}
            >
              <Network className="w-4 h-4" />
            </ToolbarButton>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Mapa Mental</span>
        </div>

      </div>
    </div>
  );
}