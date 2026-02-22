"use client";

import { CalendarDays, Users, Target, Bell } from 'lucide-react';
import { CalendarEvent } from '@/types';
import { isSameDay, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface CalendarStatsProps {
  events: CalendarEvent[];
}

export function CalendarStats({ events }: CalendarStatsProps) {
  const now = new Date();
  
  const todayEvents = events.filter(e => isSameDay(new Date(e.startDate), now)).length;
  
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekEvents = events.filter(e => isWithinInterval(new Date(e.startDate), { start: weekStart, end: weekEnd })).length;
  
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthEvents = events.filter(e => isWithinInterval(new Date(e.startDate), { start: monthStart, end: monthEnd })).length;
  
  const reminders = events.filter(e => e.reminder && !e.completed).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Hoje</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{todayEvents}</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Semana</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{weekEvents}</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Mês</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{monthEvents}</p>
      </div>

      <div className="rounded-2xl p-5 bg-pastel-amber transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Lembretes</p>
        <p className="text-xl font-bold text-foreground tracking-tight">{reminders}</p>
      </div>
    </div>
  );
}