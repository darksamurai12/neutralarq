import { Calendar, Clock, Flag, Tags, Link2, Timer } from 'lucide-react';
import { Task, TaskPriority, ProjectPhase } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskMetadataGridProps {
  formData: {
    deadline: string;
    startDate: string;
    priority: TaskPriority;
    phase: ProjectPhase;
    estimatedTime: string;
    trackedTime: string;
    tags: string[];
    relatedTaskId: string;
  };
  onChange: (field: string, value: any) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'text-success' },
  medium: { label: 'Média', color: 'text-warning' },
  high: { label: 'Alta', color: 'text-orange-500' },
  critical: { label: 'Crítica', color: 'text-destructive' },
};

export function TaskMetadataGrid({ formData, onChange }: TaskMetadataGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-4 border-b border-border">
      {/* Row 1 */}
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-20 shrink-0">Datas</span>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Início</span>
          </div>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className="h-7 w-32 text-xs"
          />
          <span className="text-muted-foreground">→</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Vencimento</span>
          </div>
          <Input
            type="date"
            value={formData.deadline}
            onChange={(e) => onChange('deadline', e.target.value)}
            className="h-7 w-32 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Flag className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Prioridade</span>
        <Select
          value={formData.priority}
          onValueChange={(value: TaskPriority) => onChange('priority', value)}
        >
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(priorityConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <span className={config.color}>{config.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2 */}
      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-20 shrink-0">Tempo estimado</span>
        <Input
          type="text"
          value={formData.estimatedTime}
          onChange={(e) => onChange('estimatedTime', e.target.value)}
          placeholder="Vazio"
          className="h-7 w-24 text-xs"
        />
      </div>

      <div className="flex items-center gap-3">
        <Timer className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Tempo rastreado</span>
        <span className="text-sm text-primary cursor-pointer hover:underline">
          + Adicionar hora
        </span>
      </div>

      {/* Row 3 */}
      <div className="flex items-center gap-3">
        <Tags className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-20 shrink-0">Etiquetas</span>
        <span className="text-sm text-muted-foreground">Vazio</span>
      </div>

      <div className="flex items-center gap-3">
        <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Relacionamentos</span>
        <span className="text-sm text-muted-foreground">Vazio</span>
      </div>
    </div>
  );
}
