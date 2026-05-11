"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartCardProps = {
  title: string;
  data: Record<string, string | number>[];
  primaryKey: string;
  secondaryKey?: string;
};

export function ChartCard({ title, data, primaryKey, secondaryKey }: ChartCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -16, right: 6, top: 8 }}>
              <defs>
                <linearGradient id={`${primaryKey}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#075BFF" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#075BFF" stopOpacity={0} />
                </linearGradient>
                {secondaryKey ? (
                  <linearGradient id={`${secondaryKey}-fill`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#081A3A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#081A3A" stopOpacity={0} />
                  </linearGradient>
                ) : null}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d8e3f5" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #dbe6f5",
                  boxShadow: "0 16px 40px rgba(8,26,58,.12)"
                }}
              />
              <Area
                type="monotone"
                dataKey={primaryKey}
                stroke="#075BFF"
                fill={`url(#${primaryKey}-fill)`}
                strokeWidth={3}
              />
              {secondaryKey ? (
                <Area
                  type="monotone"
                  dataKey={secondaryKey}
                  stroke="#081A3A"
                  fill={`url(#${secondaryKey}-fill)`}
                  strokeWidth={3}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
