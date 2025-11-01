
'use client';

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const chartdata = [
  { month: "Jan", followers: 186 },
  { month: "Fev", followers: 305 },
  { month: "Mar", followers: 237 },
  { month: "Abr", followers: 73 },
  { month: "Mai", followers: 209 },
  { month: "Jun", followers: 214 },
  { month: "Jul", followers: 345 },
  { month: "Ago", followers: 456 },
  { month: "Set", followers: 367 },
  { month: "Out", followers: 589 },
  { month: "Nov", followers: 690 },
  { month: "Dez", followers: 890 },
];

export function GrowthChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartdata} margin={{ left: -20, right: 20, top: 10, bottom: 0 }}>
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
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Area type="monotone" dataKey="followers" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorFollowers)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
