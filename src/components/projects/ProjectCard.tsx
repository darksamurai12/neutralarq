"use client";

import React from 'react';
import { 
  Building2, 
  MapPin, 
  CalendarClock, 
  DollarSign, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Clock,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project, ProjectStatus, ProjectType } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

interface ProjectCardProps {
  project: Project;
  clientName: string;
  progress: number;
  taskCount: number;
  subprojectCount: number;
  onEdit: (project: Project, e?: React.MouseEvent) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onClick: (id: string) => void;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string; icon: React.ElementType }> = {
  planning: { label: 'Planeamento', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: Clock },
  in_progress: { label: 'Em Execução', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: PlayCircle },
  paused: { label: 'Parado', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: PauseCircle },
  completed: { label: 'Concluído', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
};

const typeConfig: Record<ProjectType, { label: string; icon: string; color: string }> = {
  architecture: { label: 'Arquitectura', icon: '🏛️', color: 'from-violet-500 to-violet-600' },
  construction: { label: 'Construção Civil', icon: '🏗️', color: 'from-orange-500 to-orange-600' },
  interior_design: { label: 'Design de Interiores', icon: '🎨', color: 'from-pink-500 to-pink-600' },
};

export function ProjectCard({ 
  project, 
  clientName, 
  progress, 
  taskCount, 
  subprojectCount,
  onEdit, 
  onDelete, 
  onClick 
}: ProjectCardProps) {
  const StatusIcon = statusConfig[project.status].icon;
  
  return (
    <Card
      onClick={() => onClick(project.id)}
      className="group cursor-pointer shadow-lg border-0 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className={cn(
        'h-2 bg-gradient-to-r',
        typeConfig[project.type].color
      )} />
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeConfig[project.type].icon}</span>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {project.name}
              </h3>
              <p className="text-xs text-muted-foreground">{typeConfig[project.type].label}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => onEdit(project, e)}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => onDelete(project.id, e)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{clientName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="w-4 h-4 flex-shrink-0" />
            <span>{format(new Date(project.deadline), "dd MMM yyyy", { locale: pt })}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="font-semibold text-foreground">{formatCurrency(project.budget)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Progresso</span>
            <span className="text-xs font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Badge variant="outline" className={cn('font-medium gap-1', statusConfig[project.status].className)}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig[project.status].label}
          </Badge>
          <div className="flex items-center gap-2">
            {subprojectCount > 0 && (
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <FolderKanban className="w-3 h-3" />
                {subprojectCount} sub
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {taskCount} tarefa{taskCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}