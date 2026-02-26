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
import { Document, DocumentCategory } from '@/types';
import { Upload, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDoc: Document | null;
  onSubmit: (file: File | null, data: any) => void;
}

const categories: { value: DocumentCategory; label: string }[] = [
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'contratos', label: 'Contratos' },
  { value: 'projetos', label: 'Projectos' },
  { value: 'templates', label: 'Templates' },
  { value: 'outros', label: 'Outros' },
];

export function DocumentFormDialog({ open, onOpenChange, editingDoc, onSubmit }: DocumentFormDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('outros');
  const [department, setDepartment] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);

  useEffect(() => {
    if (editingDoc) {
      setName(editingDoc.name);
      setDescription(editingDoc.description || '');
      setCategory(editingDoc.category);
      setDepartment(editingDoc.department || '');
      setExpiryDate(editingDoc.expiryDate || null);
      setFile(null);
    } else {
      setName('');
      setDescription('');
      setCategory('outros');
      setDepartment('');
      setExpiryDate(null);
      setFile(null);
    }
  }, [editingDoc, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected && !name) {
      setName(selected.name.split('.')[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(file, { name, description, category, department, expiryDate });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingDoc ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!editingDoc && (
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Ficheiro *</Label>
              <div className="relative group">
                <Input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="h-20 border-dashed border-2 cursor-pointer opacity-0 absolute inset-0 z-10"
                  required={!editingDoc}
                />
                <div className="h-20 border-dashed border-2 rounded-xl flex flex-col items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500 font-medium">
                    {file ? file.name : 'Clique ou arraste para carregar'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Nome do Documento *</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Contrato Prestação Serviços" className="rounded-xl" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Categoria *</Label>
              <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase">Departamento</Label>
              <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Ex: Financeiro" className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">Data de Validade (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl">
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  {expiryDate ? format(expiryDate, "PPP", { locale: ptBR }) : <span>Sem validade definida</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-none">
                <Calendar mode="single" selected={expiryDate || undefined} onSelect={date => setExpiryDate(date || null)} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase">Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Notas adicionais sobre o documento..." rows={3} className="rounded-xl resize-none" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-xl px-8">
              {editingDoc ? 'Guardar Alterações' : 'Iniciar Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}