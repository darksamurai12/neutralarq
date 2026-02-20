import { AppLayout } from '@/components/layout/AppLayout';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  FolderKanban, 
  Wallet, 
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Target,
  Briefcase,
  DollarSign,
  Calendar as CalendarIcon
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { getDashboardMetrics } = useApp();
  const { profile, user } = useAuth();
  const metrics = getDashboardMetrics();

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Utilizador';
  const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const getInitials = () => {
    if (profile?.full_name) return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <AppLayout>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-2xl border-4 border-white shadow-glass">
            <AvatarImage src="" /> {/* Adicionar URL da foto se disponível no perfil futuramente */}
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
              <CalendarIcon className="w-4 h-4 text-primary/60" />
              <span className="capitalize">{currentDate}</span>
            </p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estado do Sistema</p>
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Tudo em dia
          </div>
        </div>
      </div>

      {/* Stats Grid - Pastel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-card border-none rounded-2xl bg-pastel-lavender/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
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
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
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
            <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
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