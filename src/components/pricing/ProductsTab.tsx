import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, Percent, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    marginPercent: '',
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', basePrice: '', marginPercent: '' });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description,
      basePrice: parseFloat(formData.basePrice),
      marginPercent: parseFloat(formData.marginPercent),
    };

    if (editingProduct) {
      onUpdate(editingProduct.id, data);
    } else {
      onAdd(data);
    }
    resetForm();
  };

  const handleEdit = (product: PricingProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      marginPercent: product.marginPercent.toString(),
    });
    setIsDialogOpen(true);
  };

  const previewFinalPrice = formData.basePrice && formData.marginPercent
    ? parseFloat(formData.basePrice) * (1 + parseFloat(formData.marginPercent) / 100)
    : 0;

  // Summary metrics
  const avgMargin = products.length > 0 
    ? products.reduce((sum, p) => sum + p.marginPercent, 0) / products.length 
    : 0;
  const totalValue = products.reduce((sum, p) => sum + p.finalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Produtos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-200" />
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
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm">Valor Total Catálogo</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Catálogo de Produtos</h3>
          <p className="text-sm text-muted-foreground">Gerencie produtos com preço base e margem de revenda</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cimento Portland"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Saco 50kg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Preço Base (AOA)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
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
                    placeholder="15"
                    required
                  />
                </div>
              </div>
              
              {/* Preview */}
              {previewFinalPrice > 0 && (
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-700">Preço de Revenda:</span>
                      <span className="text-lg font-bold text-emerald-600">{formatCurrency(previewFinalPrice)}</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      Lucro: {formatCurrency(previewFinalPrice - parseFloat(formData.basePrice || '0'))}
                    </p>
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

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
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
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(product.basePrice)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {product.marginPercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {formatCurrency(product.finalPrice)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatCurrency(product.finalPrice - product.basePrice)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="text-destructive">
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
