import { Paperclip, Plus, Trash2, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: Date;
}

interface TaskAttachmentsSectionProps {
  attachments: Attachment[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type.includes('pdf') || type.includes('document')) return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachmentsSection({
  attachments,
  onAdd,
  onRemove,
}: TaskAttachmentsSectionProps) {
  return (
    <div className="py-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Anexos</h3>

      {attachments.length > 0 && (
        <div className="space-y-2 mb-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-2 rounded-md border border-border hover:bg-muted/50 group"
            >
              <div className="text-muted-foreground">
                {getFileIcon(attachment.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(attachment.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="text-xs gap-1"
        onClick={onAdd}
      >
        <Paperclip className="w-3 h-3" />
        Adicionar anexo
      </Button>
    </div>
  );
}
