import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { useApp } from '@/contexts/AppContext';
import { LayoutDashboard, DollarSign, Wallet, FolderKanban, Users, CheckCircle2 } from 'lucide-react';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Clientes Activos"
          value={metrics.activeClients}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Projectos Activos"
          value={metrics.activeProjects}
          icon={FolderKanban}
          variant="warning"
        />
        <StatCard
          title="Projectos Concluídos"
          value={metrics.completedProjects}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Saldo Global"
          value={formatCurrency(metrics.currentBalance)}
          icon={Wallet}
          variant="default"
        />
        <StatCard
          title="Faturamento Total"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Leads no Funil"
          value={metrics.leadsInFunnel}
          icon={Users}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProjectStatusChart data={metrics.projectsByStatus} />
        <CashFlowChart data={metrics.monthlyFlow} />
      </div>

      {/* Recent Projects */}
      <RecentProjects projects={metrics.recentProjects} />
    </AppLayout>
  );
}
