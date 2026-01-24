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
              borderRadius: '12px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            formatter={(value: number) => [formatCurrency(value)]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span className="text-xs text-muted-foreground">
                {value === 'income' ? 'Entradas' : 'Saídas'}
              </span>
            )}
          />
          <Bar 
            dataKey="income" 
            fill="hsl(142, 76%, 36%)" 
            radius={[6, 6, 0, 0]} 
            name="income"
          />
          <Bar 
            dataKey="expenses" 
            fill="hsl(0, 84%, 60%)" 
            radius={[6, 6, 0, 0]} 
            name="expenses"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
