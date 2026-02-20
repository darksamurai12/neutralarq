"use client";

import { UserCheck, UserPlus, UserX, ArrowUpRight } from 'lucide-react';

interface ClientStatsProps {
  activeCount: number;
  leadCount: number;
  inactiveCount: number;
}

export function ClientStats({ activeCount, leadCount, inactiveCount }: ClientStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Clientes Activos</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{activeCount}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <ArrowUpRight className="w-3 h-3" />
          <span>Com projectos</span>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-amber transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Leads no Funil</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{leadCount}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <UserPlus className="w-3 h-3" />
          <span>Potenciais clientes</span>
        </div>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Clientes Inactivos</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{inactiveCount}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <UserX className="w-3 h-3" />
          <span>Sem actividade</span>
        </div>
      </div>
    </div>
  );
}