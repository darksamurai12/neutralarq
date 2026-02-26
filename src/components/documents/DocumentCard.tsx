"use client";

import { Document } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Download, Eye, Trash2, MoreVertical, 
  File, Image, FileArchive, Calendar, ShieldAlert, 
  Archive, History, Pencil
} from 'lucide-react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface DocumentCardProps {
  doc: Document;
  onDelete: (id: string, filePath: string) => void;
  onDownload: (filePath: string) => void;
  onEdit: (doc: Document) => void;
  onArchive: (doc: Document) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-rose-500" />;
  if (mimeType.includes('image')) return <Image className="w-8 h-8 text-blue-500" />;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return <FileArchive className="w-8 h-8 text-amber-500" />;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return <File className="w-8 h-8 text-emerald-500" />;
  return <File className="w-8 h-8 text-slate-400" />;
}

export function DocumentCard({ doc, onDelete, onDownload, onEdit, onArchive }: DocumentCardProps) {
  const isExpired = doc.expiryDate && isPast(new Date(doc.expiryDate));
  
  return (
    <Card className={cn(
      "group hover:shadow-md transition-all border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden",
      doc.status === 'archived' && "opacity-75 grayscale-[0.5]"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {getFileIcon(doc.fileType)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 truncate" title={doc.name}>
                  {doc.name}
                </h3>
                {doc.version > 1 && (
                  <Badge variant="secondary" className="text-[9px] h-4 px-1">v{doc.version}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-black mt-1">
                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{doc.category}</span>
                <span>•</span>
                <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onDownload(doc.filePath)}>
                <Eye className="w-4 h-4 mr-2" /> Visualizar / Abrir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(doc.filePath)}>
                <Download className="w-4 h-4 mr-2" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(doc)}>
                <Pencil className="w-4 h-4 mr-2" /> Editar Metadados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(doc)}>
                <Archive className="w-4 h-4 mr-2" /> {doc.status === 'archived' ? 'Desarquivar' : 'Arquivar'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(doc.id, doc.filePath)}>
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExpired && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-1.5 rounded-lg">
            <ShieldAlert className="w-3 h-3" /> DOCUMENTO EXPIRADO
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
            <Calendar className="w-3 h-3" />
            {format(doc.createdAt, "dd MMM yyyy", { locale: ptBR })}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[10px] font-black uppercase text-primary hover:bg-primary/5"
              onClick={() => onDownload(doc.filePath)}
            >
              Abrir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}