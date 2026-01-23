import { ProjectHistory as ProjectHistoryType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, Clock } from 'lucide-react';

interface ProjectHistoryProps {
  history: ProjectHistoryType[];
}

export function ProjectHistory({ history }: ProjectHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Nenhum histórico registado
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <History className="w-4 h-4" />
        Histórico e Auditoria
      </h4>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.action}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(item.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
