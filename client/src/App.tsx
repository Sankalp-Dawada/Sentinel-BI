import { useEffect, useState } from "react";
import {
  Activity,
  RefreshCw,
  Database,
  PieChart,
  Zap,
  Shield,
  Layers,
  Sparkles,
  Server
} from "lucide-react";
import { fetchDashboard, type Dashboard } from "./lib/api";
import KpiCard from "./components/KpiCard";
import RevenueChart from "./components/RevenueChart";
import "./App.css";

interface LiveEvent {
  id: string;
  time: string;
  type: string;
  detail: string;
  amount?: number;
}

export default function App() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [live, setLive] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activityFeed, setActivityFeed] = useState<LiveEvent[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchDashboard();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const source = new EventSource("https://sentinel-bi.onrender.com/api/events");

    source.addEventListener("connected", () => {
      setLive(true);
      addFeedItem("CONNECTED", "Telemetry stream linked with PostgreSQL");
    });

    source.addEventListener("refresh", () => {
      load();
    });

    source.onerror = () => {
      setLive(false);
    };

    return () => source.close();
  }, []);

  const addFeedItem = (type: string, detail: string, amount?: number) => {
    setActivityFeed((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        time: new Date().toLocaleTimeString(),
        type,
        detail,
        amount
      },
      ...prev.slice(0, 5)
    ]);
  };

  // Simulate real-time live business transactions
  const triggerSimulatedTransaction = async () => {
    try {
      setSimulating(true);
      const customerIds = [1, 2, 3];
      const randomCust = customerIds[Math.floor(Math.random() * customerIds.length)];
      const randomAmount = Math.floor(Math.random() * 18000) + 2000;

      const res = await fetch("https://sentinel-bi.onrender.com/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: randomCust,
          amount: randomAmount,
          status: "completed",
          occurredAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        const json = await res.json();
        addFeedItem("TRANSACTION", `Ingested corporate txn #${json.id}`, json.amount);
        await load();
      }
    } catch (e) {
      console.error("Simulation error", e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <main className="shell">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="badge-corp">
            <Shield size={13} />
            EXECUTIVE BI & CORPORATE TELEMETRY
          </div>
          <h1 className="header-title">Corporate KPI Intelligence</h1>
          <p className="header-subtitle">
            Real-time business telemetry tracking revenue velocity, order throughput, and segment distributions.
          </p>
        </div>

        <div className="header-controls">
          <div className="telemetry-badge">
            <span className={live ? "pulse-dot live" : "pulse-dot"} />
            <span>{live ? "STREAM ACTIVE" : "DISCONNECTED"}</span>
          </div>

          <button
            className="btn-action sim-btn"
            onClick={triggerSimulatedTransaction}
            disabled={simulating}
            title="Simulate Influx Transaction"
          >
            <Zap size={15} />
            {simulating ? "Ingesting..." : "Simulate Live Txn"}
          </button>

          <button className="btn-action" onClick={load} title="Force Refresh">
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Sync
          </button>
        </div>
      </header>

      {/* Error alert */}
      {error && <div className="alert-box">{error}</div>}

      {/* Loading */}
      {loading && !data ? (
        <div className="loading-container">
          <Activity size={36} color="#00f2fe" />
          <p>Decrypting & streaming real-time KPI ledger...</p>
        </div>
      ) : (
        data && (
          <>
            {/* Top KPI Metric Cards */}
            <section className="kpi-grid">
              {data.kpis.map((kpi) => (
                <KpiCard key={kpi.key} kpi={kpi} />
              ))}
            </section>

            {/* Main Visualizations Grid */}
            <section className="dashboard-grid">
              {/* Left Main Chart */}
              <article className="panel-card">
                <div className="panel-header">
                  <div className="panel-heading-group">
                    <h3>
                      <Database size={18} color="#00f2fe" />
                      Revenue Velocity & Hourly Throughput
                    </h3>
                    <p>
                      Trailing 24-Hour chronological telemetry showing aggregate transactional volume (₹).
                    </p>
                  </div>
                  <div className="badge-corp" style={{ fontSize: "10px" }}>
                    HOURLY AGGREGATE
                  </div>
                </div>

                <RevenueChart data={data.trend} />
              </article>

              {/* Right Segment Breakdown */}
              <article className="panel-card">
                <div className="panel-header">
                  <div className="panel-heading-group">
                    <h3>
                      <PieChart size={18} color="#8b5cf6" />
                      Market Segment Share
                    </h3>
                    <p>Revenue distribution by enterprise tier</p>
                  </div>
                  <Layers size={16} color="#94a3b8" />
                </div>

                <div className="segments-list">
                  {data.segments.map((seg) => {
                    const topRevenue = Math.max(...data.segments.map((s) => s.revenue), 1);
                    const pct = ((seg.revenue / topRevenue) * 100).toFixed(0);

                    return (
                      <div className="segment-item" key={seg.segment}>
                        <div className="segment-info">
                          <span className="segment-name">{seg.segment}</span>
                          <span className="segment-val">
                            ₹{seg.revenue.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="segment-progress">
                          <div className="segment-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>

            {/* Live Telemetry Activity Feed */}
            {activityFeed.length > 0 && (
              <section className="feed-grid">
                <article className="panel-card" style={{ padding: "18px 24px" }}>
                  <div className="panel-header" style={{ marginBottom: "12px" }}>
                    <div className="panel-heading-group">
                      <h3>
                        <Sparkles size={16} color="#10b981" />
                        Live Transaction & Event Stream
                      </h3>
                    </div>
                  </div>
                  <div className="activity-feed">
                    {activityFeed.map((item) => (
                      <div className="activity-row" key={item.id}>
                        <span className="activity-badge">[{item.type}]</span>
                        <span>{item.detail}</span>
                        {item.amount && (
                          <strong style={{ color: "#00f2fe" }}>
                            +₹{item.amount.toLocaleString("en-IN")}
                          </strong>
                        )}
                        <span style={{ color: "#64748b" }}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            )}

            {/* Footer */}
            <footer className="dashboard-footer">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Server size={14} color="#10b981" />
                <span>PostgreSQL 16 Engine · Real-time SSE Sync (10s pulse)</span>
              </div>
              <div>Snapshot Generated: {new Date(data.generatedAt).toLocaleTimeString()}</div>
            </footer>
          </>
        )
      )}
    </main>
  );
}
