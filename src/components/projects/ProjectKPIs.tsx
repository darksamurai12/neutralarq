import { ProjectKPIs as ProjectKPIsType } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target,
  Wallet,
  BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProjectKPIsProps {
  kpis: ProjectKPIsType;
  budget: number;
}

export function ProjectKPIs({ kpis, budget }: ProjectKPIsProps) {
  const budgetAlert = kpis.budgetPercentage >= 80;
  const budgetExceeded = kpis.budgetPercentage > 100;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        Indicadores do Projecto (KPIs)
      </h4>

      {/* Progress & Tasks Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span>Progresso Geral</span>
          </div>
          <div className="text-2xl font-bold text-foreground mb-2">{kpis.progressPercentage}%</div>
          <Progress value={kpis.progressPercentage} className="h-2" />
        </div>

        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span>Desvio de Prazo</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            kpis.deadlineDeviation > 0 ? "text-destructive" : "text-success"
          )}>
            {kpis.deadlineDeviation > 0 ? '+' : ''}{kpis.deadlineDeviation} dias
          </div>
        </div>
      </div>

      {/* Tasks by Status */}
      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="text-sm text-muted-foreground mb-3">Tarefas por Estado</div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded bg-muted/50">
            <div className="text-lg font-semibold text-foreground">{kpis.tasksByStatus.todo}</div>
            <div className="text-xs text-muted-foreground">A Fazer</div>
          </div>
          <div className="text-center p-2 rounded bg-primary/10">
            <div className="text-lg font-semibold text-primary">{kpis.tasksByStatus.doing}</div>
            <div className="text-xs text-muted-foreground">Em Progresso</div>
          </div>
          <div className="text-center p-2 rounded bg-warning/10">
            <div className="text-lg font-semibold text-warning">{kpis.tasksByStatus.review}</div>
            <div className="text-xs text-muted-foreground">Em Revisão</div>
          </div>
          <div className="text-center p-2 rounded bg-success/10">
            <div className="text-lg font-semibold text-success">{kpis.tasksByStatus.done}</div>
            <div className="text-xs text-muted-foreground">Concluído</div>
          </div>
        </div>
        {kpis.overdueTasks > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span>{kpis.overdueTasks} tarefa(s) atrasada(s)</span>
          </div>
        )}
      </div>

      {/* Budget Control */}
      <div className={cn(
        "p-4 rounded-lg border",
        budgetExceeded ? "border-destructive/50 bg-destructive/5" :
        budgetAlert ? "border-warning/50 bg-warning/5" :
        "border-border bg-card"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="w-4 h-4" />
            <span>Controlo Orçamental</span>
          </div>
          {budgetExceeded && (
            <span className="text-xs font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Orçamento excedido!
            </span>
          )}
          {budgetAlert && !budgetExceeded && (
            <span className="text-xs font-medium text-warning flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Acima de 80%
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Orçamento Total</span>
            <span className="font-medium text-foreground">{formatCurrency(budget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gasto</span>
            <span className="font-medium text-destructive">{formatCurrency(kpis.budgetUsed)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Disponível</span>
            <span className={cn("font-medium", kpis.budgetRemaining >= 0 ? "text-success" : "text-destructive")}>
              {formatCurrency(kpis.budgetRemaining)}
            </span>
          </div>
          <Progress 
            value={Math.min(kpis.budgetPercentage, 100)} 
            className={cn(
              "h-2 mt-2",
              budgetExceeded && "[&>div]:bg-destructive",
              budgetAlert && !budgetExceeded && "[&>div]:bg-warning"
            )} 
          />
          <div className="text-right text-xs text-muted-foreground">
            {kpis.budgetPercentage}% utilizado
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-success/20 bg-success/5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingUp className="w-3 h-3 text-success" />
            Entradas
          </div>
          <p className="text-lg font-semibold text-success">{formatCurrency(kpis.totalIncome)}</p>
        </div>
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingDown className="w-3 h-3 text-destructive" />
            Saídas
          </div>
          <p className="text-lg font-semibold text-destructive">{formatCurrency(kpis.totalExpenses)}</p>
        </div>
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            Lucro
          </div>
          <p className={cn(
            "text-lg font-semibold",
            kpis.profit >= 0 ? "text-success" : "text-destructive"
          )}>{formatCurrency(kpis.profit)}</p>
        </div>
      </div>
    </div>
  );
}
