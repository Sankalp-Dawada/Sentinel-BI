# 📊 Sentinel BI: Executive KPI Dashboard

Sentinel BI is a high-performance, real-time Business Intelligence platform engineered for enterprise leaders to monitor financial health, transactional velocity, and operational telemetry. Built with a "command-center" aesthetic, it bridges the gap between raw PostgreSQL data and executive decision-making.

---

## 🏛️ System Architecture

The Sentinel BI platform utilizes a reactive, decoupled architecture designed for high-frequency data updates without polling overhead.

### Architectural Breakdown
- **Telemetry Ingestion:** Real-time stream processing of transaction events into a PostgreSQL 16 time-series ready schema.
- **Backend Core:** A Node.js API server leveraging Express, Zod for schema enforcement, and **Server-Sent Events (SSE)** for push-based updates.
- **Client Interface:** A reactive, glassmorphic React dashboard built with **Vite** and **Recharts**, delivering high-fidelity data visualizations.

**Visual Representation:**
*   **Data Tier:** PostgreSQL persistent storage with optimized indexing on `occurred_at`.
*   **Application Tier:** Express middleware handling RESTful resource requests and maintaining persistent SSE connections.
*   **Client Tier:** SPA rendering engine that subscribes to the event stream, enabling "zero-refresh" live dashboard updates.

---

## 🗄️ Database & Data Model

We use a normalized relational model optimized for temporal queries.

| Table | Primary Purpose | Key Features |
| :--- | :--- | :--- |
| `customers` | Entity Management | Segment tagging for enterprise analytics |
| `transactions` | Financial Ledger | Indexed `occurred_at` for high-speed time-series retrieval |

---

## 📈 Executive Metrics

Sentinel BI transforms raw logs into high-level business intelligence:
1.  **Revenue Velocity:** Hourly throughput tracking.
2.  **Order Throughput:** Real-time transaction count.
3.  **Customer Acquisition:** Growth in unique active account metrics.
4.  **Market Segmentation:** Live revenue share breakdown by account tier.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 16
- Podman or Docker (for containerized DB)

### Quick Start
```bash
# 1. Start the Database
podman compose up -d

# 2. Install Dependencies
npm install
npm install --prefix server
npm install --prefix client

# 3. Launch the Platform
npm run dev:all
```

---

## 📜 License

This project is licensed under the **MIT License**.

```text
MIT License

Copyright (c) 2026 Sentinel BI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
