import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { AlertBanner } from '@/components/alerts/AlertCenter';
import { useApp } from '@/contexts/AppContext';
import { 
  LayoutDashboard, 
  DollarSign, 
  Wallet, 
  FolderKanban, 
  Users, 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Briefcase
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

      {/* Alert Banner */}
      <AlertBanner />

      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {/* Clientes Activos */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium mb-1">Clientes Activos</p>
                <p className="text-2xl font-bold tracking-tight">{metrics.activeClients}</p>
                <div className="flex items-center gap-1 mt-1 text-blue-100 text-xs">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+2 este mês</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10" />
          </CardContent>
        </Card>

        {/* Projectos Activos */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs font-medium mb-1">Projectos Activos</p>
                <p className="text-2xl font-bold tracking-tight">{metrics.activeProjects}</p>
                <div className="flex items-center gap-1 mt-1 text-amber-100 text-xs">
                  <Briefcase className="w-3 h-3" />
                  <span>Em execução</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10" />
          </CardContent>
        </Card>

        {/* Projectos Concluídos */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium mb-1">Projectos Concluídos</p>
                <p className="text-2xl font-bold tracking-tight">{metrics.completedProjects}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-100 text-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Finalizados</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10" />
          </CardContent>
        </Card>

        {/* Saldo Global */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-xs font-medium mb-1">Saldo Global</p>
                <p className="text-lg font-bold tracking-tight">{formatCurrency(metrics.currentBalance)}</p>
                <div className="flex items-center gap-1 mt-1 text-violet-100 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>Disponível</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10" />
          </CardContent>
        </Card>

        {/* Faturamento Total */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-xs font-medium mb-1">Faturamento Total</p>
                <p className="text-lg font-bold tracking-tight">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1 text-teal-100 text-xs">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Receitas</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10" />
          </CardContent>
        </Card>

        {/* Leads no Funil */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-xs font-medium mb-1">Leads no Funil</p>
                <p className="text-2xl font-bold tracking-tight">{metrics.leadsInFunnel}</p>
                <div className="flex items-center gap-1 mt-1 text-rose-100 text-xs">
                  <Target className="w-3 h-3" />
                  <span>Potenciais</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-white/10" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderKanban className="w-4 h-4 text-primary" />
              </div>
              Distribuição de Projectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={metrics.projectsByStatus} />
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
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
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary" />
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
