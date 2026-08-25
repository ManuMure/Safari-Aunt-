"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#1F422E", "#8B4A1E", "#D89242", "#F0C68A"];

export default function DestinationsChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F422E1A" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#1F422E99" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#1F422E99" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
 formatter={(value) => [value, "Bookings"]}
  contentStyle={{ borderRadius: 8, border: "1px solid #1F422E20", fontSize: 12 }}
/>
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}