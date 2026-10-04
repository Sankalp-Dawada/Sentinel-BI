# 📊 Corporate KPI Business Intelligence (BI) Dashboard

A real-time Executive Business Intelligence dashboard engineered for tracking critical Key Performance Indicators (KPIs), transactional velocity, and segment distributions in corporate management.

---

## 🎯 Use Case & Purpose

In corporate management, executives and operations leads require real-time visibility into financial health, order volume, and customer activity. This dashboard provides:

1. **Real-Time Financial Telemetry:** Instant tracking of gross revenue, order volume, Average Order Value (AOV), and customer engagement without manual reporting delays.
2. **Revenue Velocity & Hourly Throughput Analysis:** Visualizing revenue trends across time slices to detect traffic surges, operational bottlenecks, or sales dips.
3. **Market Segment Distribution:** Analyzing customer tiers (*Enterprise*, *Mid-Market*, *SMB*) to guide high-value account retention and resource allocation.
4. **Live Transaction Streaming:** Utilizing **Server-Sent Events (SSE)** to stream and broadcast transaction updates directly from the database to active management clients.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vite + React Client                  │
│       (Dark Glassmorphic UI, Recharts, Lucide Icons)    │
└────────────────────────────┬────────────────────────────┘
                             │
                  HTTP REST / SSE Stream
                             │
┌────────────────────────────▼────────────────────────────┐
│                  Node.js / Express API                  │
│        (TypeScript, Vitest, Zod Validation, SSE)        │
└────────────────────────────┬────────────────────────────┘
                             │
                      SQL Connection
                             │
┌────────────────────────────▼────────────────────────────┐
│                 PostgreSQL 16 Engine                    │
│      (Customers, Transactions, Temporal Indexes)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database & Data Model

The application runs on **PostgreSQL 16** with indexed relational tables:

### 1. `customers` Table
Represents enterprise clients and corporate accounts categorized by business segment.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Unique customer ID |
| `name` | `TEXT NOT NULL` | Corporate account name (e.g., *Acme Corp*, *Northstar Ltd*, *Vertex Labs*) |
| `segment` | `TEXT NOT NULL` | Market category (`Enterprise`, `Mid-Market`, `SMB`) |
| `created_at` | `TIMESTAMPTZ` | Account onboarding timestamp |

### 2. `transactions` Table
Stores chronological financial events and order processing logs.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `BIGSERIAL PRIMARY KEY` | Unique transaction ID |
| `customer_id` | `INTEGER REFERENCES customers(id)` | Foreign key referencing the corporate customer |
| `amount` | `NUMERIC(14,2) NOT NULL` | Transaction total in INR (`₹`) |
| `status` | `TEXT NOT NULL` | Transaction state (`completed`, `refunded`, `pending`) |
| `occurred_at` | `TIMESTAMPTZ` | Timestamp of transaction |

---

## 📈 Key Performance Indicators (KPIs)

- **Total Revenue (₹):** Aggregate sum of all completed transactions within the selected window.
- **Order Volume:** Total number of successful orders processed.
- **Average Order Value (AOV):** Calculated as `Total Revenue ÷ Total Orders`.
- **Active Customers:** Count of unique customers who completed at least one transaction in the current period.
- **Trajectory & Change Percentage:** Automatic computation comparing current metrics with the preceding equivalent time slice.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v20/v24)
- **PostgreSQL 16** (or Podman / Docker container runtime)

### 1. Database Setup
Start the PostgreSQL database:
```bash
# Using Docker or Podman Compose
podman compose up -d
# or
docker compose up -d
```

### 2. Install Dependencies
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Run the Application
Run both backend API and frontend Vite server concurrently with a single command:
```bash
npm run dev:all
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173) (or `http://localhost:5174`)
- **Backend API:** `http://localhost:4000`

---

## 🧪 Testing

Run the automated backend test suite (unit and integration tests with Vitest):
```bash
npm test --prefix server
```

---

## ⚡ API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/dashboard?from=&to=` | Fetch aggregated KPI figures, hourly trends, and segment breakdowns |
| `POST` | `/api/transactions` | Ingest a new transaction and broadcast a real-time SSE refresh |
| `GET` | `/api/events` | Server-Sent Events (SSE) telemetry connection for real-time dashboard updates |
