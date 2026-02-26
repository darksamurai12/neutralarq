"use client";

import { Document } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink, Trash2, MoreVertical, File, Image, FileArchive } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentCardProps {
  doc: Document;
  onDelete: (id: string, fileId: string) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-rose-500" />;
  if (mimeType.includes('image')) return <Image className="w-8 h-8 text-blue-500" />;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return <FileArchive className="w-8 h-8 text-amber-500" />;
  return <File className="w-8 h-8 text-slate-400" />;
}

export function DocumentCard({ doc, onDelete }: DocumentCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {getFileIcon(doc.mimeType)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 truncate" title={doc.name}>
                {doc.name}
              </h3>
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
              <DropdownMenuItem onClick={() => window.open(doc.webViewLink, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" /> Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(doc.downloadLink, '_blank')}>
                <Download className="w-4 h-4 mr-2" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(doc.id, doc.fileId)}>
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-300">
            {format(doc.createdAt, "dd MMM yyyy", { locale: ptBR })}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] font-black uppercase text-primary hover:bg-primary/5"
            onClick={() => window.open(`https://drive.google.com/file/d/${doc.fileId}/view`, '_blank')}
          >
            Abrir no Drive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}