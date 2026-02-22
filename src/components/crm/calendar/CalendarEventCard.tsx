"use client";

import { CalendarEvent } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { eventTypeConfig } from './CalendarConstants';

interface CalendarEventCardProps {
  event: CalendarEvent;
  compact?: boolean;
  clientName?: string | null;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (event: CalendarEvent) => void;
}

export function CalendarEventCard({ 
  event, 
  compact = false, 
  clientName, 
  onEdit, 
  onDelete, 
  onToggleComplete 
}: CalendarEventCardProps) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;

  if (compact) {
    return (
      <div 
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-md truncate cursor-pointer hover:brightness-95 transition-all border shadow-sm',
          config.pastelClass,
          config.color,
          event.completed && 'opacity-50 line-through grayscale'
        )}
        onClick={(e) => { e.stopPropagation(); onEdit(event); }}
      >
        {event.title}
      </div>
    );
  }

  return (
    <Card className={cn(
      'group border-l-4 shadow-sm hover:shadow-md transition-all duration-200',
      event.completed && 'opacity-60 grayscale'
    )} style={{ borderLeftColor: config.bgClass.replace('bg-', '') }}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleComplete(event); }}
                className="flex-shrink-0"
              >
                {event.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
              <span className={cn(
                'font-semibold text-sm truncate text-slate-700',
                event.completed && 'line-through text-muted-foreground'
              )}>
                {event.title}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Icon className={cn('w-3 h-3', config.color)} />
              {!event.allDay && (
                <span>
                  {format(new Date(event.startDate), 'HH:mm')}
                </span>
              )}
              {clientName && <span className="truncate">• {clientName}</span>}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(event.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}