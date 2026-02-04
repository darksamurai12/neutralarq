import { useState } from 'react';
import { Plus, Pencil, Trash2, Truck, Percent, TrendingUp } from 'lucide-react';
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
import { PricingTransport } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface TransportTabProps {
  transport: PricingTransport[];
  onAdd: (transport: Omit<PricingTransport, 'id' | 'createdAt' | 'finalPrice'>) => void;
  onUpdate: (id: string, updates: Partial<PricingTransport>) => void;
  onDelete: (id: string) => void;
}

export function TransportTab({ transport, onAdd, onUpdate, onDelete }: TransportTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<PricingTransport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseCost: '',
    marginPercent: '',
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', baseCost: '', marginPercent: '' });
    setEditingTransport(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description,
      baseCost: parseFloat(formData.baseCost),
      marginPercent: parseFloat(formData.marginPercent),
    };

    if (editingTransport) {
      onUpdate(editingTransport.id, data);
    } else {
      onAdd(data);
    }
    resetForm();
  };

  const handleEdit = (transportItem: PricingTransport) => {
    setEditingTransport(transportItem);
    setFormData({
      name: transportItem.name,
      description: transportItem.description,
      baseCost: transportItem.baseCost.toString(),
      marginPercent: transportItem.marginPercent.toString(),
    });
    setIsDialogOpen(true);
  };

  const previewFinalPrice = formData.baseCost && formData.marginPercent
    ? parseFloat(formData.baseCost) * (1 + parseFloat(formData.marginPercent) / 100)
    : 0;

  // Summary metrics
  const avgMargin = transport.length > 0 
    ? transport.reduce((sum, t) => sum + t.marginPercent, 0) / transport.length 
    : 0;
  const totalValue = transport.reduce((sum, t) => sum + t.finalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm">Total Transportes</p>
                <p className="text-2xl font-bold">{transport.length}</p>
              </div>
              <Truck className="h-8 w-8 text-cyan-200" />
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
                <p className="text-blue-100 text-sm">Valor Total Fretes</p>
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
          <h3 className="text-lg font-semibold">Transporte</h3>
          <p className="text-sm text-muted-foreground">Cadastre tipos de frete com custo base e margem</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Transporte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransport ? 'Editar Transporte' : 'Novo Transporte'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tipo de Transporte</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Frete Local"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Até 20km"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseCost">Custo Base (AOA)</Label>
                  <Input
                    id="baseCost"
                    type="number"
                    step="0.01"
                    value={formData.baseCost}
                    onChange={(e) => setFormData({ ...formData, baseCost: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marginPercent">Margem (%)</Label>
                  <Input
                    id="marginPercent"
                    type="number"
                    step="0.1"
                    value={formData.marginPercent}
                    onChange={(e) => setFormData({ ...formData, marginPercent: e.target.value })}
                    placeholder="20"
                    required
                  />
                </div>
              </div>
              
              {/* Preview */}
              {previewFinalPrice > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-700">Preço Cliente:</span>
                      <span className="text-lg font-bold text-emerald-600">{formatCurrency(previewFinalPrice)}</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      Lucro: {formatCurrency(previewFinalPrice - parseFloat(formData.baseCost || '0'))}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit">{editingTransport ? 'Guardar' : 'Adicionar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transport Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Transporte</TableHead>
                <TableHead className="text-right">Custo Base</TableHead>
                <TableHead className="text-center">Margem</TableHead>
                <TableHead className="text-right">Preço Cliente</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transport.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum transporte cadastrado. Clique em "Novo Transporte" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                transport.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.baseCost)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                        {item.marginPercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {formatCurrency(item.finalPrice)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatCurrency(item.finalPrice - item.baseCost)}
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
