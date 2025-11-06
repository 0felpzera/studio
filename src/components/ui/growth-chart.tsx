
'use client';

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import type { FollowerHistory } from "@/lib/types";

const parseTimeToMonths = (timeToGoal: string): number => {
    if (!timeToGoal) return 12;
    const timeMatch = timeToGoal.match(/~?(\d+(\.\d)?)\s*(months|years|ano|anos|mês|meses)/i);
    if (!timeMatch) return 12;

    const value = parseFloat(timeMatch[1]);
    const unit = timeMatch[3].toLowerCase();

    if (unit.startsWith('ano') || unit.startsWith('year')) {
        return Math.round(value * 12);
    }
    return Math.round(value);
};


const generateProjectedData = (initialFollowers: number = 1500, goalFollowers: number = 100000, timeToGoal: string = '~12 months') => {
    const totalMonths = parseTimeToMonths(timeToGoal);
    if (totalMonths <= 0 || initialFollowers <= 0) return [];
    
    const data = [];
    // Adjust growth factor to be based on the dynamic number of months
    const growthFactor = Math.pow(goalFollowers / initialFollowers, 1 / (totalMonths -1));

    for (let i = 0; i < totalMonths; i++) {
        data.push({
            month: `Mês ${i + 1}`,
            projectedFollowers: Math.round(initialFollowers * Math.pow(growthFactor, i)),
        });
    }
    // Ensure the last data point is exactly the goal
    if (data.length > 0) {
        data[data.length - 1].projectedFollowers = goalFollowers;
    }
    
    return data;
}

const mergeData = (projectedData: any[], realHistory: FollowerHistory[]) => {
    if (!realHistory || realHistory.length === 0) {
        return projectedData.map(d => ({ ...d, realFollowers: null }));
    }

    // Find the start date of the projection (assume it's today)
    const projectionStartDate = new Date();
    projectionStartDate.setDate(1); // Start of current month

    const mergedData = projectedData.map((pData, index) => {
        const monthStartDate = new Date(projectionStartDate);
        monthStartDate.setMonth(projectionStartDate.getMonth() + index);
        
        // Find the closest historical data point for that month
        const historyForMonth = realHistory.filter(h => {
            const historyDate = new Date(h.date);
            return historyDate.getFullYear() === monthStartDate.getFullYear() && historyDate.getMonth() === monthStartDate.getMonth();
        });

        // Get the last record for that month if multiple exist
        const lastRecord = historyForMonth.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
            ...pData,
            realFollowers: lastRecord ? lastRecord.count : null,
        }
    });

    return mergedData;
}


interface GrowthChartProps {
    initialFollowers?: number;
    goalFollowers?: number;
    timeToGoal?: string;
    realFollowersHistory?: FollowerHistory[];
}

export function GrowthChart({ initialFollowers = 1500, goalFollowers = 100000, timeToGoal = '~12 months', realFollowersHistory = [] }: GrowthChartProps) {
  const projectedData = generateProjectedData(initialFollowers, goalFollowers, timeToGoal);
  const chartData = useMemo(() => mergeData(projectedData, realFollowersHistory), [projectedData, realFollowersHistory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/80 backdrop-blur-sm border border-border shadow-lg rounded-lg p-3 text-sm">
          <p className="label font-bold text-foreground">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.color }}>
              {`${pld.name}: ${pld.value?.toLocaleString('pt-BR') || 'N/A'}`}
            </p>
          ))}
        </div>
      );
    }
  
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
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
        <Tooltip content={<CustomTooltip />} />
        <Area 
            type="monotone" 
            dataKey="projectedFollowers" 
            name="Projeção IA"
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#colorProjected)" 
        />
        <Line 
            type="monotone" 
            dataKey="realFollowers" 
            name="Crescimento Real"
            stroke="hsl(var(--chart-5))" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
