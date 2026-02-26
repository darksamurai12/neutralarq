import { Calendar, Clock, Flag, Tags, Link2, Timer, Briefcase, User } from 'lucide-react';
import { TaskPriority, TaskType } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskMetadataGridProps {
  formData: {
    deadline: string;
    startDate: string;
    priority: TaskPriority;
    type: TaskType;
    responsible: string;
    estimatedTime: string;
    trackedTime: string;
    tags: string[];
  };
  onChange: (field: string, value: any) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'text-success' },
  medium: { label: 'Média', color: 'text-warning' },
  high: { label: 'Alta', color: 'text-orange-500' },
  urgent: { label: 'Urgente', color: 'text-destructive' },
};

export function TaskMetadataGrid({ formData, onChange }: TaskMetadataGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-6 border-b border-border">
      {/* Tipo e Responsável */}
      <div className="flex items-center gap-3">
        <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Tipo</span>
        <Select
          value={formData.type}
          onValueChange={(value: TaskType) => onChange('type', value)}
        >
          <SelectTrigger className="h-8 w-full text-xs bg-white dark:bg-slate-950">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
            <SelectItem value="internal">Tarefa Interna</SelectItem>
            <SelectItem value="personal">Tarefa Pessoal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <User className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Responsável</span>
        <Input
          value={formData.responsible}
          onChange={(e) => onChange('responsible', e.target.value)}
          className="h-8 text-xs bg-white dark:bg-slate-950"
        />
      </div>

      {/* Datas */}
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Início</span>
        <Input
          type="date"
          value={formData.startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
          className="h-8 text-xs bg-white dark:bg-slate-950"
        />
      </div>

      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Conclusão</span>
        <Input
          type="date"
          value={formData.deadline}
          onChange={(e) => onChange('deadline', e.target.value)}
          className="h-8 text-xs bg-white dark:bg-slate-950"
        />
      </div>

      {/* Prioridade */}
      <div className="flex items-center gap-3">
        <Flag className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Prioridade</span>
        <Select
          value={formData.priority}
          onValueChange={(value: TaskPriority) => onChange('priority', value)}
        >
          <SelectTrigger className="h-8 w-full text-xs bg-white dark:bg-slate-950">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
            {Object.entries(priorityConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <span className={config.color}>{config.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Timer className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-muted-foreground w-24 shrink-0">Tempo Est.</span>
        <Input
          placeholder="Ex: 2h"
          value={formData.estimatedTime}
          onChange={(e) => onChange('estimatedTime', e.target.value)}
          className="h-8 text-xs bg-white dark:bg-slate-950"
        />
      </div>
    </div>
  );
}