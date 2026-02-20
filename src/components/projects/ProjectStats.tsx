"use client";

import { Clock, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-react';

interface ProjectStatsProps {
  planningCount: number;
  activeCount: number;
  pausedCount: number;
  completedCount: number;
}

export function ProjectStats({ planningCount, activeCount, pausedCount, completedCount }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Em Planeamento</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{planningCount}</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Em Execução</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{activeCount}</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-amber transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <PauseCircle className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Parados</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{pausedCount}</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Concluídos</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{completedCount}</p>
      </div>
    </div>
  );
}