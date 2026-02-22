import { useState } from 'react';
import { Plus, Pencil, Trash2, Users, Percent, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PricingLabor } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface LaborTabProps {
  labor: PricingLabor[];
  onAdd: (labor: Omit<PricingLabor, 'id' | 'createdAt' | 'finalPrice'>) => void;
  onUpdate: (id: string, updates: Partial<PricingLabor>) => void;
  onDelete: (id: string) => void;
}

export function LaborTab({ labor, onAdd, onUpdate, onDelete }: LaborTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabor, setEditingLabor] = useState<PricingLabor | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', providerValue: '', marginPercent: '' });

  const resetForm = () => { setFormData({ name: '', description: '', providerValue: '', marginPercent: '' }); setEditingLabor(null); setIsDialogOpen(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: formData.name, description: formData.description, providerValue: parseFloat(formData.providerValue), marginPercent: parseFloat(formData.marginPercent) };
    if (editingLabor) onUpdate(editingLabor.id, data);
    else onAdd(data);
    resetForm();
  };

  const handleEdit = (laborItem: PricingLabor) => {
    setEditingLabor(laborItem);
    setFormData({ name: laborItem.name, description: laborItem.description, providerValue: laborItem.providerValue.toString(), marginPercent: laborItem.marginPercent.toString() });
    setIsDialogOpen(true);
  };

  const previewFinalPrice = formData.providerValue && formData.marginPercent ? parseFloat(formData.providerValue) * (1 + parseFloat(formData.marginPercent) / 100) : 0;
  const avgMargin = labor.length > 0 ? labor.reduce((sum, l) => sum + l.marginPercent, 0) / labor.length : 0;
  const totalValue = labor.reduce((sum, l) => sum + l.finalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-pastel-amber transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Prestadores</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{labor.length}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Percent className="w-5 h-5" /></div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Margem Média</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{avgMargin.toFixed(1)}%</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Valor Total Serviços</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mão de Obra</h3>
          <p className="text-sm text-muted-foreground">Cadastre prestadores com valor e margem da empresa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Novo Prestador</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingLabor ? 'Editar Prestador' : 'Novo Prestador'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome / Função</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Pedreiro Especializado" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Ex: Diária" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="providerValue">Valor Prestador (AOA)</Label>
                  <Input id="providerValue" type="number" step="0.01" value={formData.providerValue} onChange={(e) => setFormData({ ...formData, providerValue: e.target.value })} placeholder="0,00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marginPercent">Margem Empresa (%)</Label>
                  <Input id="marginPercent" type="number" step="0.1" value={formData.marginPercent} onChange={(e) => setFormData({ ...formData, marginPercent: e.target.value })} placeholder="30" required />
                </div>
              </div>
              {previewFinalPrice > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium text-emerald-700">Preço Cliente Final:</span><span className="text-lg font-bold text-emerald-600">{formatCurrency(previewFinalPrice)}</span></div>
                    <p className="text-xs text-emerald-600 mt-1">Lucro Empresa: {formatCurrency(previewFinalPrice - parseFloat(formData.providerValue || '0'))}</p>
                  </CardContent>
                </Card>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit">{editingLabor ? 'Guardar' : 'Adicionar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg border-0 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Prestador / Função</TableHead>
                <TableHead className="text-right">Valor Prestador</TableHead>
                <TableHead className="text-center">Margem</TableHead>
                <TableHead className="text-right">Preço Cliente</TableHead>
                <TableHead className="text-right">Lucro Empresa</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labor.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum prestador cadastrado.</TableCell></TableRow>
              ) : (
                labor.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.description}</p></div></TableCell>
                    <TableCell className="text-right">{formatCurrency(item.providerValue)}</TableCell>
                    <TableCell className="text-center"><Badge variant="secondary" className="bg-amber-100 text-amber-700">{item.marginPercent}%</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">{formatCurrency(item.finalPrice)}</TableCell>
                    <TableCell className="text-right text-emerald-600">{formatCurrency(item.finalPrice - item.providerValue)}</TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button></div></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}