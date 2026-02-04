import { useState } from 'react';
import { Plus, Pencil, Trash2, Users, Percent, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    providerValue: '',
    marginPercent: '',
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', providerValue: '', marginPercent: '' });
    setEditingLabor(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description,
      providerValue: parseFloat(formData.providerValue),
      marginPercent: parseFloat(formData.marginPercent),
    };

    if (editingLabor) {
      onUpdate(editingLabor.id, data);
    } else {
      onAdd(data);
    }
    resetForm();
  };

  const handleEdit = (laborItem: PricingLabor) => {
    setEditingLabor(laborItem);
    setFormData({
      name: laborItem.name,
      description: laborItem.description,
      providerValue: laborItem.providerValue.toString(),
      marginPercent: laborItem.marginPercent.toString(),
    });
    setIsDialogOpen(true);
  };

  const previewFinalPrice = formData.providerValue && formData.marginPercent
    ? parseFloat(formData.providerValue) * (1 + parseFloat(formData.marginPercent) / 100)
    : 0;

  // Summary metrics
  const avgMargin = labor.length > 0 
    ? labor.reduce((sum, l) => sum + l.marginPercent, 0) / labor.length 
    : 0;
  const totalValue = labor.reduce((sum, l) => sum + l.finalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Total Prestadores</p>
                <p className="text-2xl font-bold">{labor.length}</p>
              </div>
              <Users className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Margem Média</p>
                <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
              </div>
              <Percent className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Valor Total Serviços</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mão de Obra</h3>
          <p className="text-sm text-muted-foreground">Cadastre prestadores com valor e margem da empresa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Prestador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLabor ? 'Editar Prestador' : 'Novo Prestador'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome / Função</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Pedreiro Especializado"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Diária"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="providerValue">Valor Prestador (AOA)</Label>
                  <Input
                    id="providerValue"
                    type="number"
                    step="0.01"
                    value={formData.providerValue}
                    onChange={(e) => setFormData({ ...formData, providerValue: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marginPercent">Margem Empresa (%)</Label>
                  <Input
                    id="marginPercent"
                    type="number"
                    step="0.1"
                    value={formData.marginPercent}
                    onChange={(e) => setFormData({ ...formData, marginPercent: e.target.value })}
                    placeholder="30"
                    required
                  />
                </div>
              </div>
              
              {/* Preview */}
              {previewFinalPrice > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-700">Preço Cliente Final:</span>
                      <span className="text-lg font-bold text-emerald-600">{formatCurrency(previewFinalPrice)}</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      Lucro Empresa: {formatCurrency(previewFinalPrice - parseFloat(formData.providerValue || '0'))}
                    </p>
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

      {/* Labor Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
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
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum prestador cadastrado. Clique em "Novo Prestador" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                labor.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.providerValue)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        {item.marginPercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {formatCurrency(item.finalPrice)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatCurrency(item.finalPrice - item.providerValue)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
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
