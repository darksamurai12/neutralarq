"use client";

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { CheckSquare, Plus, Search, Calendar, User, LayoutGrid, List, AlertCircle, Clock, ShieldAlert, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TaskEditDialog } from '@/components/tasks/TaskEditDialog';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Baixa', color: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { label: 'Média', color: 'text-blue-600', bg: 'bg-blue-50' },
  high: { label: 'Alta', color: 'text-amber-600', bg: 'bg-amber-50' },
  urgent: { label: 'Urgente', color: 'text-rose-600', bg: 'bg-rose-50' },
};

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: 'text-slate-500', bg: 'bg-slate-100' },
  in_progress: { label: 'Em andamento', color: 'text-blue-600', bg: 'bg-blue-100' },
  completed: { label: 'Concluída', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  canceled: { label: 'Cancelada', color: 'text-rose-600', bg: 'bg-rose-100' },
};

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('all');
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Métricas
  const metrics = useMemo(() => {
    const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const overdue = tasks.filter(t => t.status !== 'completed' && t.status !== 'canceled' && isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline))).length;
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
    
    return { pending, overdue, urgent };
  }, [tasks]);

  const responsibles = useMemo(() => {
    const names = tasks.map(t => t.responsible).filter(Boolean);
    return Array.from(new Set(names));
  }, [tasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;
    const matchesResp = responsibleFilter === 'all' || task.responsible === responsibleFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesResp;
  });

  const renderTaskCard = (task: Task) => {
    const isOverdue = task.status !== 'completed' && task.status !== 'canceled' && isPast(new Date(task.deadline)) && !isToday(new Date(task.deadline));
    const priority = priorityConfig[task.priority];
    const status = statusConfig[task.status];
    
    return (
      <Card 
        key={task.id} 
        className="group hover:shadow-md transition-all duration-200 border-none shadow-sm cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
        onClick={() => setEditingTask(task)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={cn("text-[10px] font-bold uppercase px-1.5 py-0 rounded-md", priority.bg, priority.color)}>
                  {priority.label}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold uppercase px-1.5 py-0 rounded-md border-slate-200">
                  {task.type === 'personal' ? 'Pessoal' : 'Interna'}
                </Badge>
              </div>
              <h3 className={cn("font-bold text-slate-700 dark:text-slate-200 truncate", task.status === 'completed' && "line-through opacity-50")}>
                {task.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 mt-1">{task.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={cn("text-[10px] font-bold", status.bg, status.color)}>
                {status.label}
              </Badge>
              {isOverdue && (
                <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> ATRASADA
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <User className="w-3.5 h-3.5" />
                <span>{task.responsible}</span>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium",
                isOverdue ? "text-rose-500" : "text-slate-500"
              )}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(new Date(task.deadline), "dd MMM", { locale: ptBR })}</span>
              </div>
            </div>
            <div className="w-20">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", task.status === 'completed' ? 'bg-emerald-500' : 'bg-primary')}
                  style={{ width: `${task.status === 'completed' ? 100 : task.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="Gestão de Tarefas"
        description="Controlo de actividades internas e pessoais do escritório"
        icon={CheckSquare}
      >
        <div className="flex gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-9 w-9 rounded-lg", viewMode === 'list' && "bg-white dark:bg-slate-700 shadow-sm")}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-9 w-9 rounded-lg", viewMode === 'kanban' && "bg-white dark:bg-slate-700 shadow-sm")}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </Button>
        </div>
      </PageHeader>

      {/* Dashboard de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Tarefas Pendentes</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{metrics.pending}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-rose transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Tarefas Atrasadas</p>
          <p className="text-2xl font-bold text-rose-600 tracking-tight">{metrics.overdue}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-amber transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Urgentes</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{metrics.urgent}</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm border-none rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Pesquisar tarefas..."
                className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-950">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
                <SelectItem value="all">Todos Estados</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="canceled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-950">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
                <SelectItem value="all">Todas Prioridades</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
              <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-950">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border shadow-xl">
                <SelectItem value="all">Todos Responsáveis</SelectItem>
                {responsibles.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visualizações */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(renderTaskCard)}
          {filteredTasks.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100">
              <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Nenhuma tarefa encontrada</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['pending', 'in_progress', 'completed'].map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">
                  {statusConfig[status as TaskStatus].label}
                </h3>
                <Badge variant="secondary" className="rounded-full">
                  {filteredTasks.filter(t => t.status === status).length}
                </Badge>
              </div>
              <div className="space-y-3 min-h-[500px] p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200">
                {filteredTasks.filter(t => t.status === status).map(renderTaskCard)}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={addTask}
      />

      <TaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={updateTask}
        onDelete={deleteTask}
      />
    </AppLayout>
  );
}