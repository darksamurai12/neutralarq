import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MonthlyFlow } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface CashFlowChartProps {
  data: MonthlyFlow[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const formatCompact = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
    }).format(value);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card animate-in-up">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Fluxo de Caixa Mensal</h3>
        <p className="text-sm text-muted-foreground">Entradas vs Saídas (últimos 6 meses)</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={formatCompact}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [formatCurrency(value)]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))', fontSize: 12 }}>
                  {value === 'income' ? 'Entradas' : 'Saídas'}
                </span>
              )}
            />
            <Bar 
              dataKey="income" 
              fill="hsl(var(--success))" 
              radius={[4, 4, 0, 0]} 
              name="income"
            />
            <Bar 
              dataKey="expenses" 
              fill="hsl(var(--destructive))" 
              radius={[4, 4, 0, 0]} 
              name="expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
