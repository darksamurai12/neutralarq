import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  progress: number;
  clientName?: string;
  taskCount?: number;
  subprojectCount?: number;
  onEdit: (project: Project, e?: React.MouseEvent) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onClick: (id: string) => void;
}

const statusConfig = {
  planning: { label: 'Planeamento', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { label: 'Em Curso', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  paused: { label: 'Pausado', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  completed: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export function ProjectCard({ project, progress, clientName, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.planning;

  return (
    <Card 
      className="group overflow-hidden border-none shadow-sm hover:shadow-glass transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl"
      onClick={() => onClick(project.id)}
    >
      {/* Project Header Icon */}
      <div className="relative h-24 w-full flex items-center justify-center bg-gradient-to-br from-pastel-sky to-pastel-lavender">
        <FolderKanban className="w-10 h-10 text-primary/40" />
        <Badge className={cn("absolute top-3 right-3 border shadow-sm", status.color)}>
          {status.label}
        </Badge>
      </div>

      <CardContent className="p-5">
        <div className="mb-4">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{clientName || 'Cliente'}</p>
          <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Progresso</span>
            <span className="font-bold text-slate-700">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{format(new Date(project.deadline), "dd MMM", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-end">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{formatCurrency(project.budget)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}