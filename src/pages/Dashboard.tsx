import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import { WelcomeHeader } from '@/components/dashboard/WelcomeHeader';
import { useApp } from '@/contexts/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Wallet, 
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Target,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { getDashboardMetrics } = useApp();
  const metrics = getDashboardMetrics();

  return (
    <AppLayout>
      <WelcomeHeader />

      <PageHeader
        title="Visão Geral"
        description="Métricas de desempenho e estado atual do negócio"
        icon={LayoutDashboard}
      />

      {/* Stats Grid - Responsive Columns */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <DashboardStatCard
          title="Clientes Activos"
          value={metrics.activeClients}
          subtitle="+2 este mês"
          subtitleIcon={ArrowUpRight}
          icon={Users}
          pastelClass="bg-pastel-lavender"
          iconColor="bg-primary/10 text-primary"
        />
        <DashboardStatCard
          title="Projectos Activos"
          value={metrics.activeProjects}
          subtitle="Em execução"
          subtitleIcon={Briefcase}
          icon={FolderKanban}
          pastelClass="bg-pastel-peach"
          iconColor="bg-orange-100 text-orange-600"
        />
        <DashboardStatCard
          title="Concluídos"
          value={metrics.completedProjects}
          subtitle="Finalizados"
          subtitleIcon={CheckCircle2}
          icon={CheckCircle2}
          pastelClass="bg-pastel-mint"
          iconColor="bg-emerald-100 text-emerald-600"
        />
        <DashboardStatCard
          title="Saldo Global"
          value={formatCurrency(metrics.currentBalance)}
          subtitle="Disponível"
          subtitleIcon={TrendingUp}
          icon={Wallet}
          pastelClass="bg-pastel-sky"
          iconColor="bg-blue-100 text-blue-600"
        />
        <DashboardStatCard
          title="Faturamento"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Receitas"
          subtitleIcon={ArrowUpRight}
          icon={DollarSign}
          pastelClass="bg-pastel-amber"
          iconColor="bg-amber-100 text-amber-600"
        />
        <DashboardStatCard
          title="Leads no Funil"
          value={metrics.leadsInFunnel}
          subtitle="Potenciais"
          subtitleIcon={Target}
          icon={Target}
          pastelClass="bg-pastel-rose"
          iconColor="bg-rose-100 text-rose-600"
        />
      </div>

      {/* Charts Row - Stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-card border-none rounded-2xl bg-pastel-lavender/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                <FolderKanban className="w-4 h-4 text-primary" />
              </div>
              Distribuição de Projectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={metrics.projectsByStatus} />
          </CardContent>
        </Card>

        <Card className="shadow-card border-none rounded-2xl bg-pastel-mint/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              Fluxo de Caixa Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={metrics.monthlyFlow} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="shadow-card border-none rounded-2xl bg-pastel-slate">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4 text-orange-600" />
            </div>
            Projectos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentProjects projects={metrics.recentProjects} />
        </CardContent>
      </Card>
    </AppLayout>
  );
}