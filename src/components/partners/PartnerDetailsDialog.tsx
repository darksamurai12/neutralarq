"use client";

import { 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  Pencil, 
  Trash2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Partner } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PartnerDetailsDialogProps {
  partner: Partner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
}

export function PartnerDetailsDialog({ 
  partner, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete 
}: PartnerDetailsDialogProps) {
  if (!partner) return null;

  const infoItems = [
    { icon: Mail, label: 'Email', value: partner.email || 'Não registado' },
    { icon: Phone, label: 'Telefone', value: partner.phone || 'Não registado' },
    { icon: Briefcase, label: 'Serviços', value: partner.services || 'Não especificado' },
    { icon: ShieldCheck, label: 'NIF', value: partner.nif || 'Não registado' },
    { icon: MapPin, label: 'Endereço', value: partner.address || 'Sem endereço' },
    { icon: Calendar, label: 'Registado em', value: format(partner.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-none shadow-2xl custom-scrollbar">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-primary font-bold text-2xl bg-pastel-lavender shadow-sm">
              {partner.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <DialogTitle className="text-2xl font-bold text-slate-800">{partner.name}</DialogTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="px-3 py-0.5 rounded-full border-none bg-slate-100 text-slate-500">
                  {partner.type}
                </Badge>
                <Badge className={cn(
                  "px-3 py-0.5 rounded-full border-none",
                  partner.status === 'Ativo' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                )}>
                  {partner.status}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 mb-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">Informações de Contacto e Registo</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {infoItems.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-start justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:text-primary transition-colors">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-700 break-words">
                      {item.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-4 pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold"
            onClick={() => onEdit(partner)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar Parceiro
          </Button>
          <Button
            variant="destructive"
            className="h-11 w-11 rounded-xl p-0"
            onClick={() => {
              if (confirm('Tem a certeza que deseja eliminar este parceiro?')) {
                onDelete(partner.id);
                onOpenChange(false);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}