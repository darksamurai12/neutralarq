import { Project, ProjectStatus, ProjectType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentProjectsProps {
  projects: Project[];
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: { label: 'Planeamento', className: 'bg-muted text-muted-foreground border-border' },
  in_progress: { label: 'Em Execução', className: 'bg-primary/10 text-primary border-primary/20' },
  paused: { label: 'Parado', className: 'bg-warning/10 text-warning border-warning/20' },
  completed: { label: 'Concluído', className: 'bg-success/10 text-success border-success/20' },
};

const typeLabels: Record<ProjectType, string> = {
  architecture: 'Arquitectura',
  construction: 'Construção Civil',
  interior_design: 'Design de Interiores',
};

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FolderKanban className="w-5 h-5" />
          Projectos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum projecto registado
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(project.deadline), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn('text-xs', statusConfig[project.status].className)}>
                      {statusConfig[project.status].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{typeLabels[project.type]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
