"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { month: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1F422E" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#1F422E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F422E1A" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#1F422E99" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#1F422E99" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip
 formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, "Revenue"]}
  contentStyle={{ borderRadius: 8, border: "1px solid #1F422E20", fontSize: 12 }}
/>
        <Area
          type="monotone"
          dataKey="total"
          stroke="#1F422E"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}