import { Project, ProjectStatus, ProjectType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { MapPin, Calendar, Clock, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentProjectsProps {
  projects: Project[];
}

const statusConfig: Record<ProjectStatus, { label: string; className: string; icon: React.ElementType }> = {
  planning: { label: 'Planeamento', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: Clock },
  in_progress: { label: 'Em Execução', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: PlayCircle },
  paused: { label: 'Parado', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: PauseCircle },
  completed: { label: 'Concluído', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
};

const typeConfig: Record<ProjectType, { label: string; icon: string }> = {
  architecture: { label: 'Arquitectura', icon: '🏛️' },
  construction: { label: 'Construção Civil', icon: '🏗️' },
  interior_design: { label: 'Design de Interiores', icon: '🎨' },
};

export function RecentProjects({ projects }: RecentProjectsProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl bg-muted/30 border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Nenhum projecto registado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const StatusIcon = statusConfig[project.status].icon;
        return (
          <div
            key={project.id}
            className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{typeConfig[project.type].icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {project.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(project.deadline), "dd MMM yyyy", { locale: pt })}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={cn('flex-shrink-0 text-xs gap-1', statusConfig[project.status].className)}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig[project.status].label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
