import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, Percent, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PricingProduct } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface ProductsTabProps {
  products: PricingProduct[];
  onAdd: (product: Omit<PricingProduct, 'id' | 'createdAt' | 'finalPrice'>) => void;
  onUpdate: (id: string, updates: Partial<PricingProduct>) => void;
  onDelete: (id: string) => void;
}

export function ProductsTab({ products, onAdd, onUpdate, onDelete }: ProductsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PricingProduct | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', basePrice: '', marginPercent: '' });

  const resetForm = () => { setFormData({ name: '', description: '', basePrice: '', marginPercent: '' }); setEditingProduct(null); setIsDialogOpen(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: formData.name, description: formData.description, basePrice: parseFloat(formData.basePrice), marginPercent: parseFloat(formData.marginPercent) };
    if (editingProduct) onUpdate(editingProduct.id, data);
    else onAdd(data);
    resetForm();
  };

  const handleEdit = (product: PricingProduct) => {
    setEditingProduct(product);
    setFormData({ name: product.name, description: product.description, basePrice: product.basePrice.toString(), marginPercent: product.marginPercent.toString() });
    setIsDialogOpen(true);
  };

  const previewFinalPrice = formData.basePrice && formData.marginPercent ? parseFloat(formData.basePrice) * (1 + parseFloat(formData.marginPercent) / 100) : 0;
  const avgMargin = products.length > 0 ? products.reduce((sum, p) => sum + p.marginPercent, 0) / products.length : 0;
  const totalValue = products.reduce((sum, p) => sum + p.finalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-pastel-sky transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Package className="w-5 h-5" /></div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Produtos</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{products.length}</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-mint transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Percent className="w-5 h-5" /></div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Margem Média</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{avgMargin.toFixed(1)}%</p>
        </div>

        <div className="rounded-2xl p-5 bg-pastel-lavender transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Valor Total Catálogo</p>
          <p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Catálogo de Produtos</h3>
          <p className="text-sm text-muted-foreground">Gerencie produtos com preço base e margem de revenda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Novo Produto</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Cimento Portland" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Ex: Saco 50kg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Preço Base (AOA)</Label>
                  <Input id="basePrice" type="number" step="0.01" value={formData.basePrice} onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })} placeholder="0,00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marginPercent">Margem (%)</Label>
                  <Input id="marginPercent" type="number" step="0.1" value={formData.marginPercent} onChange={(e) => setFormData({ ...formData, marginPercent: e.target.value })} placeholder="15" required />
                </div>
              </div>
              {previewFinalPrice > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium text-emerald-700">Preço de Revenda:</span><span className="text-lg font-bold text-emerald-600">{formatCurrency(previewFinalPrice)}</span></div>
                    <p className="text-xs text-emerald-600 mt-1">Lucro: {formatCurrency(previewFinalPrice - parseFloat(formData.basePrice || '0'))}</p>
                  </CardContent>
                </Card>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit">{editingProduct ? 'Guardar' : 'Adicionar'}</Button>
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
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Preço Base</TableHead>
                <TableHead className="text-center">Margem</TableHead>
                <TableHead className="text-right">Preço Revenda</TableHead>
                <TableHead className="text-right">Lucro Unit.</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum produto cadastrado.</TableCell></TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell><div><p className="font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.description}</p></div></TableCell>
                    <TableCell className="text-right">{formatCurrency(product.basePrice)}</TableCell>
                    <TableCell className="text-center"><Badge variant="secondary" className="bg-blue-100 text-blue-700">{product.marginPercent}%</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">{formatCurrency(product.finalPrice)}</TableCell>
                    <TableCell className="text-right text-emerald-600">{formatCurrency(product.finalPrice - product.basePrice)}</TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button></div></TableCell>
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