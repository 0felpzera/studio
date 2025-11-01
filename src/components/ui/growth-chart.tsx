
'use client';

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const generateChartData = (initialFollowers: number = 1500, goalFollowers: number = 100000) => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const data = [];
    const growthFactor = Math.pow(goalFollowers / initialFollowers, 1 / (months.length -1));

    for (let i = 0; i < months.length; i++) {
        data.push({
            month: months[i],
            followers: Math.round(initialFollowers * Math.pow(growthFactor, i)),
        });
    }
    return data;
}

interface GrowthChartProps {
    initialFollowers?: number;
    goalFollowers?: number;
}

export function GrowthChart({ initialFollowers, goalFollowers }: GrowthChartProps) {
  const chartdata = generateChartData(initialFollowers, goalFollowers);
  
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

    