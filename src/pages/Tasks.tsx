"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { CheckSquare, Plus, Search, Filter, Calendar, User, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TaskEditDialog } from '@/components/tasks/TaskEditDialog';

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Baixa', color: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { label: 'Média', color: 'text-blue-600', bg: 'bg-blue-50' },
  high: { label: 'Alta', color: 'text-amber-600', bg: 'bg-amber-50' },
  critical: { label: 'Crítica', color: 'text-rose-600', bg: 'bg-rose-50' },
};

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'A Fazer', color: 'bg-slate-400' },
  doing: { label: 'Em Curso', color: 'bg-blue-500' },
  review: { label: 'Revisão', color: 'bg-amber-500' },
  done: { label: 'Concluído', color: 'bg-emerald-500' },
};

export default function Tasks() {
  const { tasks, projects, updateTask, deleteTask } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Projecto Desconhecido';
  };

  return (
    <AppLayout>
      <PageHeader
        title="Tarefas"
        description="Gestão centralizada de todas as atividades"
        icon={CheckSquare}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-3 shadow-sm border-none rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Pesquisar tarefas..."
                  className="pl-9 h-11 rounded-xl bg-slate-50/50 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="w-[140px] h-11 rounded-xl">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Estados</SelectItem>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="doing">Em Curso</SelectItem>
                    <SelectItem value="review">Revisão</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
                  <SelectTrigger className="w-[140px] h-11 rounded-xl">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none rounded-2xl bg-primary/5">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Pendentes</p>
            <p className="text-3xl font-black text-primary">
              {tasks.filter(t => t.status !== 'done').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <CheckSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
            const priority = priorityConfig[task.priority];
            
            return (
              <Card 
                key={task.id} 
                className="group hover:shadow-md transition-all duration-200 border-none shadow-sm cursor-pointer rounded-2xl overflow-hidden"
                onClick={() => setEditingTask(task)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={cn("w-1.5", statusConfig[task.status].color)} />
                    <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={cn("text-[10px] font-bold uppercase px-1.5 py-0 rounded-md", priority.bg, priority.color)}>
                            {priority.label}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {getProjectName(task.projectId)}
                          </span>
                        </div>
                        <h3 className={cn("font-bold text-slate-700 truncate", task.status === 'done' && "line-through opacity-50")}>
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-6 flex-shrink-0">
                        {task.responsible && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <User className="w-3.5 h-3.5" />
                            <span>{task.responsible}</span>
                          </div>
                        )}
                        
                        {task.deadline && (
                          <div className={cn(
                            "flex items-center gap-1.5 text-xs font-medium",
                            isOverdue ? "text-rose-500" : "text-slate-500"
                          )}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{format(new Date(task.deadline), "dd MMM", { locale: ptBR })}</span>
                          </div>
                        )}

                        <div className="w-24">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>{task.completionPercentage}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full transition-all duration-500", statusConfig[task.status].color)}
                              style={{ width: `${task.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

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