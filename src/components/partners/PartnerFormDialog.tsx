"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Partner } from '@/types';

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPartner: Partner | null;
  onSubmit: (data: any) => void;
}

const emptyFormData = {
  name: '',
  type: 'Fornecedor',
  email: '',
  phone: '',
  services: '',
  status: 'Ativo',
  nif: '',
  address: '',
};

export function PartnerFormDialog({ open, onOpenChange, editingPartner, onSubmit }: PartnerFormDialogProps) {
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (editingPartner) {
      setFormData({
        name: editingPartner.name,
        type: editingPartner.type,
        email: editingPartner.email,
        phone: editingPartner.phone,
        services: editingPartner.services,
        status: editingPartner.status,
        nif: editingPartner.nif,
        address: editingPartner.address,
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [editingPartner, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome / Empresa *</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Subempreiteiro">Subempreiteiro</SelectItem>
                  <SelectItem value="Consultor">Consultor</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input id="nif" value={formData.nif} onChange={e => setFormData({...formData, nif: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Serviços / Especialidade</Label>
            <Input id="services" value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})} placeholder="Ex: Carpintaria, Venda de Materiais..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-xl px-8 font-bold">
              {editingPartner ? 'Guardar Alterações' : 'Adicionar Parceiro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}