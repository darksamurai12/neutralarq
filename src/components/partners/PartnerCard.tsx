"use client";

import { Partner } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Briefcase, MoreHorizontal, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface PartnerCardProps {
  partner: Partner;
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
  onClick: (partner: Partner) => void;
}

export function PartnerCard({ partner, onEdit, onDelete, onClick }: PartnerCardProps) {
  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-glass border-none bg-white dark:bg-slate-900 rounded-2xl shadow-sm cursor-pointer"
      onClick={() => onClick(partner)}
    >
      <div className={cn(
        "h-2 w-full",
        partner.status === 'Ativo' ? "bg-emerald-400" : "bg-slate-300"
      )} />
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-pastel-lavender flex items-center justify-center text-primary font-bold text-xl">
              {partner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                {partner.name}
              </h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-md bg-slate-100 text-slate-500 border-none">
                {partner.type}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(partner); }}>
                <Pencil className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={(e) => { e.stopPropagation(); onDelete(partner.id); }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{partner.email || 'Sem email'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{partner.phone || 'Sem telefone'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{partner.services || 'Serviços não especificados'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
            <ShieldCheck className="w-3 h-3" />
            NIF: {partner.nif || '---'}
          </div>
          <Badge className={cn(
            "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-none",
            partner.status === 'Ativo' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
          )}>
            {partner.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}