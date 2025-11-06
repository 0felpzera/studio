
'use client';

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const parseTimeToMonths = (timeToGoal: string): number => {
    const timeMatch = timeToGoal.match(/~?(\d+(\.\d)?)\s*(months|years|ano|anos|mês|meses)/i);
    if (!timeMatch) return 12; // Fallback to 12 months

    const value = parseFloat(timeMatch[1]);
    const unit = timeMatch[3].toLowerCase();

    if (unit.startsWith('ano') || unit.startsWith('year')) {
        return Math.round(value * 12);
    }
    return Math.round(value);
};


const generateChartData = (initialFollowers: number = 1500, goalFollowers: number = 100000, timeToGoal: string = '~12 months') => {
    const totalMonths = parseTimeToMonths(timeToGoal);
    if (totalMonths <= 0) return [];
    
    const data = [];
    // Adjust growth factor to be based on the dynamic number of months
    const growthFactor = Math.pow(goalFollowers / initialFollowers, 1 / (totalMonths -1));

    for (let i = 0; i < totalMonths; i++) {
        data.push({
            month: `Mês ${i + 1}`,
            followers: Math.round(initialFollowers * Math.pow(growthFactor, i)),
        });
    }
    // Ensure the last data point is exactly the goal
    if (data.length > 0) {
        data[data.length - 1].followers = goalFollowers;
    }
    
    return data;
}

interface GrowthChartProps {
    initialFollowers?: number;
    goalFollowers?: number;
    timeToGoal?: string;
}

export function GrowthChart({ initialFollowers, goalFollowers, timeToGoal }: GrowthChartProps) {
  const chartdata = generateChartData(initialFollowers, goalFollowers, timeToGoal);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartdata} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="month"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval={'preserveStartEnd'}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Seguidores']}
        />
        <Area type="monotone" dataKey="followers" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorFollowers)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
