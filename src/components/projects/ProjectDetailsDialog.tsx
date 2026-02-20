"use client";

import React from 'react';
import { 
  Pencil, 
  Trash2, 
  ArrowUpRight, 
  DollarSign,
  Clock,
  PlayCircle,
  PauseCircle,
  CheckCircle2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectWithDetails, ProjectStatus, ProjectType, Project } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { ProjectKPIs } from './ProjectKPIs';
import { SubprojectsList } from './SubprojectsList';
import { TaskKanban } from './TaskKanban';
import { ProjectHistory } from './ProjectHistory';

interface ProjectDetailsDialogProps {
  project: ProjectWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onSelectSubproject: (id: string) => void;
  subprojects: Project[];
  addTask: any;
  updateTask: any;
  deleteTask: any;
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

export function ProjectDetailsDialog({ 
  project, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete, 
  onSelectSubproject,
  subprojects,
  addTask,
  updateTask,
  deleteTask
}: ProjectDetailsDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto border-none shadow-2xl custom-scrollbar">
        {/* Breadcrumb for subprojects */}
        {project.parentProjectId && (
          <button
            onClick={() => onSelectSubproject(project.parentProjectId!)}
            className="flex items-center gap-1 text-xs text-primary hover:underline mb-3 transition-colors"
          >
            <ArrowUpRight className="w-3 h-3 rotate-[225deg]" />
            Voltar ao projecto principal
          </button>
        )}
        <DialogHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                'h-14 w-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg',
                typeConfig[project.type].color
              )}>
                {typeConfig[project.type].icon}
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-bold text-slate-800">{project.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{typeConfig[project.type].label}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => onEdit(project)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-xl"
                onClick={() => onDelete(project.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Badge variant="outline" className={cn('w-fit mt-3 gap-1 px-3 py-0.5 rounded-full border-none', statusConfig[project.status].className)}>
            {React.createElement(statusConfig[project.status].icon, { className: 'w-3 h-3' })}
            {statusConfig[project.status].label}
          </Badge>
        </DialogHeader>

        {/* Project Info */}
        <div className="mb-6 p-5 rounded-2xl bg-slate-50/50 border border-slate-100/50 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</span>
              <p className="font-bold text-slate-700 truncate">{project.client?.name || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local</span>
              <p className="font-bold text-slate-700 truncate">{project.location}</p>
            </div>
            <div className="p-3 rounded-xl bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Início</span>
              <p className="font-bold text-slate-700">{format(new Date(project.startDate), "dd/MM/yyyy")}</p>
            </div>
            <div className="p-3 rounded-xl bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prazo</span>
              <p className="font-bold text-slate-700">{format(new Date(project.deadline), "dd/MM/yyyy")}</p>
            </div>
          </div>
          {project.description && (
            <div className="p-4 rounded-xl bg-pastel-lavender/30 border border-pastel-lavender/50">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Descrição</span>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{project.description}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="kpis" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-6 bg-slate-100/50 p-1 rounded-2xl">
            <TabsTrigger value="kpis" className="rounded-xl data-[state=active]:shadow-sm">KPIs</TabsTrigger>
            <TabsTrigger value="subprojects" className="rounded-xl data-[state=active]:shadow-sm gap-1">
              Sub
              {subprojects.length > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded-full">
                  {subprojects.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="kanban" className="rounded-xl data-[state=active]:shadow-sm">Tarefas</TabsTrigger>
            <TabsTrigger value="finance" className="rounded-xl data-[state=active]:shadow-sm">Finanças</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:shadow-sm">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="kpis" className="mt-0">
            <ProjectKPIs kpis={project.kpis} budget={project.budget} />
          </TabsContent>

          <TabsContent value="subprojects" className="mt-0">
            <SubprojectsList
              parentProject={project}
              subprojects={subprojects}
              onSelectSubproject={onSelectSubproject}
            />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            <TaskKanban
              tasks={project.tasks}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              projectId={project.id}
            />
          </TabsContent>

          <TabsContent value="finance" className="mt-0">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Extrato Financeiro
              </h4>
              {project.transactions.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">Nenhuma transação registada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {project.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-md transition-all"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-700">{transaction.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {format(new Date(transaction.date), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <span className={cn(
                        'font-bold text-sm',
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <ProjectHistory history={project.history} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}