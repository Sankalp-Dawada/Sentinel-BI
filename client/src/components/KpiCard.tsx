import type { KPI } from "../lib/api";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  ShoppingCart,
  Users,
  Activity
} from "lucide-react";

function getKpiIcon(key: string) {
  switch (key) {
    case "revenue":
      return <DollarSign size={18} />;
    case "orders":
      return <ShoppingCart size={18} />;
    case "aov":
      return <Activity size={18} />;
    case "activeCustomers":
      return <Users size={18} />;
    default:
      return <Activity size={18} />;
  }
}

export default function KpiCard({ kpi }: { kpi: KPI }) {
  const isUp = kpi.direction === "up";
  const isDown = kpi.direction === "down";

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{kpi.label}</span>
        <div className="kpi-icon-wrapper">
          {getKpiIcon(kpi.key)}
        </div>
      </div>

      <div className="kpi-value">{kpi.formatted}</div>

      <div className="kpi-footer">
        {kpi.changePct !== null ? (
          <span className={`kpi-pill ${kpi.direction}`}>
            {isUp && <TrendingUp size={12} />}
            {isDown && <TrendingDown size={12} />}
            {!isUp && !isDown && <Minus size={12} />}
            {kpi.changePct >= 0 ? "+" : ""}
            {kpi.changePct.toFixed(1)}%
          </span>
        ) : (
          <span className="kpi-pill flat">
            <Minus size={12} />
            0.0%
          </span>
        )}
        <span className="kpi-benchmark">vs preceding 24h</span>
      </div>
    </div>
  );
}
