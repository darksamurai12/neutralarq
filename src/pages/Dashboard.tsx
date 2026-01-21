import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { useApp } from '@/contexts/AppContext';
import { LayoutDashboard, DollarSign, Wallet, FolderKanban, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function Dashboard() {
  const { getDashboardMetrics } = useApp();
  const metrics = getDashboardMetrics();

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu negócio"
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Faturamento Total"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Saldo Atual"
          value={formatCurrency(metrics.currentBalance)}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Projetos Ativos"
          value={metrics.activeProjects}
          icon={FolderKanban}
          variant="default"
        />
        <StatCard
          title="Leads no Funil"
          value={metrics.leadsInFunnel}
          icon={Users}
          variant="warning"
        />
      </div>

      {/* Chart */}
      <CashFlowChart data={metrics.monthlyFlow} />
    </AppLayout>
  );
}
