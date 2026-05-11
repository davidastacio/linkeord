"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SeriesChartProps = {
  title: string;
  data: Record<string, string | number>[];
  keys: { key: string; label: string; color: string }[];
  height?: string;
};

export function SeriesChart({ title, data, keys, height = "h-80" }: SeriesChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        <div className="hidden gap-5 sm:flex">
          {keys.map((item) => (
            <span key={item.key} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`${height} w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -12, right: 8, top: 10 }}>
              <CartesianGrid stroke="#d8e3f5" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #dbe6f5",
                  boxShadow: "0 16px 40px rgba(8,26,58,.12)"
                }}
              />
              {keys.map((item) => (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  stroke={item.color}
                  strokeWidth={3}
                  dot={{ r: 3, fill: item.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

type DonutSummaryProps = {
  title: string;
  total: string;
  data: { name: string; value: number; amount: string; color: string }[];
};

export function DonutSummary({ title, total, data }: DonutSummaryProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 md:grid-cols-[210px_1fr]">
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={68} outerRadius={92} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-xs font-bold text-muted-foreground">RD$</p>
                <p className="text-xl font-black text-navy">{total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 self-center">
            {data.map((item) => (
              <div key={item.name} className="grid grid-cols-[1fr_auto] gap-4">
                <div className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">{item.name}</p>
                    <p className="font-black text-navy">{item.amount}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-muted-foreground">{item.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type TinyTrendProps = {
  data: Record<string, string | number>[];
  dataKey: string;
  color?: string;
};

export function TinyTrend({ data, dataKey, color = "#075BFF" }: TinyTrendProps) {
  return (
    <div className="mt-3 h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`${dataKey}-tiny`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#${dataKey}-tiny)`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
