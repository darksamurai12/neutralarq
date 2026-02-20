"use client";

import { Mail, Phone, Building, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Client, ClientStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ClientCardProps {
  client: Client;
  projectCount: number;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onClick: (client: Client) => void;
}

const statusConfig: Record<ClientStatus, { label: string; className: string; bgClass: string }> = {
  lead: { label: 'Lead', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', bgClass: 'from-amber-500 to-amber-600' },
  active: { label: 'Activo', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', bgClass: 'from-emerald-500 to-emerald-600' },
  inactive: { label: 'Inactivo', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', bgClass: 'from-slate-500 to-slate-600' },
};

export function ClientCard({ client, projectCount, onEdit, onDelete, onClick }: ClientCardProps) {
  return (
    <Card 
      className="group cursor-pointer shadow-lg border-0 bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={() => onClick(client)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br',
              statusConfig[client.status].bgClass
            )}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {client.name}
              </h3>
              <p className="text-sm text-muted-foreground">{client.company || 'Sem empresa'}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(client); }}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.position && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="w-4 h-4 flex-shrink-0" />
              <span>{client.position}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <Badge variant="outline" className={cn('font-medium', statusConfig[client.status].className)}>
            {statusConfig[client.status].label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {projectCount} projecto{projectCount !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}