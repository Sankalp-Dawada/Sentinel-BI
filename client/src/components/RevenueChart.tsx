import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: {
    label: string;
    revenue: number;
    orders?: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const orders = payload[0].payload.orders;
    return (
      <div
        style={{
          background: "#0f172a",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          borderRadius: "8px",
          padding: "10px 14px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
          color: "#f8fafc",
          fontSize: "12px",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div style={{ color: "#94a3b8", marginBottom: "4px" }}>Time: {label}</div>
        <div style={{ color: "#38bdf8", fontWeight: 700 }}>
          Revenue: ₹{Number(val).toLocaleString("en-IN")}
        </div>
        {orders !== undefined && (
          <div style={{ color: "#10b981", marginTop: "2px" }}>
            Orders: {orders}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis
            dataKey="label"
            stroke="#64748b"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
            tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#00f2fe"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#revenueGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
