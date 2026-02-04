import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calculator, Package, Users, Truck, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePricing } from '@/hooks/usePricing';
import { useApp } from '@/contexts/AppContext';
import { ProductsTab } from '@/components/pricing/ProductsTab';
import { LaborTab } from '@/components/pricing/LaborTab';
import { TransportTab } from '@/components/pricing/TransportTab';
import { BudgetTab } from '@/components/pricing/BudgetTab';

export default function Pricing() {
  const {
    products,
    labor,
    transport,
    budgets,
    addProduct,
    updateProduct,
    deleteProduct,
    addLabor,
    updateLabor,
    deleteLabor,
    addTransport,
    updateTransport,
    deleteTransport,
    createBudget,
    updateBudget,
    deleteBudget,
    createBudgetItem,
  } = usePricing();

  const { clients, projects } = useApp();

  return (
    <AppLayout>
      <PageHeader
        title="Precificação"
        description="Gestão de produtos, mão de obra, transporte e orçamentos com margens de lucro"
        icon={Calculator}
      />

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="labor" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Mão de Obra</span>
          </TabsTrigger>
          <TabsTrigger value="transport" className="gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Transporte</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Orçamentos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab
            products={products}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        </TabsContent>

        <TabsContent value="labor">
          <LaborTab
            labor={labor}
            onAdd={addLabor}
            onUpdate={updateLabor}
            onDelete={deleteLabor}
          />
        </TabsContent>

        <TabsContent value="transport">
          <TransportTab
            transport={transport}
            onAdd={addTransport}
            onUpdate={updateTransport}
            onDelete={deleteTransport}
          />
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetTab
            budgets={budgets}
            products={products}
            labor={labor}
            transport={transport}
            clients={clients}
            projects={projects}
            onCreateBudget={createBudget}
            onUpdateBudget={updateBudget}
            onDeleteBudget={deleteBudget}
            createBudgetItem={createBudgetItem}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
