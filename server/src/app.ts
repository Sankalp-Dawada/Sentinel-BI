import express from "express";
import { Request, Response } from "express";

import cors from "cors";
import { z } from "zod";

import {
  getDashboardData
} from "./db.js";

import {
  direction,
  formatCurrency,
  percentChange
} from "./kpi.js";

export const app = express();

const subscribers = new Set<Response>();

function broadcastRefresh() {

  const payload = JSON.stringify({
    at: new Date().toISOString(),
    reason: "data-change"
  });

  for (const client of subscribers) {

    client.write(
      `event: refresh\n` +
      `data: ${payload}\n\n`
    );
  }
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? ["https://sentinel-bi.onrender.com", "https://sankalp-dawada.github.io/Sentinel-BI/"]
  })
);

app.use(express.json());

const dateSchema = z.coerce.date();


// ---------------------------------------------
// HEALTH
// ---------------------------------------------

app.get(
  "/api/health",
  (_req, res) => {

    res.json({
      ok: true,
      service: "bi-dashboard-api"
    });

  }
);


// ---------------------------------------------
// DASHBOARD
// ---------------------------------------------

app.get(
  "/api/dashboard",
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const now = new Date();

      const from = req.query.from
        ? dateSchema.parse(req.query.from)
        : new Date(
            now.getTime() -
            24 * 60 * 60 * 1000
          );

      const to = req.query.to
        ? dateSchema.parse(req.query.to)
        : now;

      if (from >= to) {

        return res.status(400).json({
          error:
            "from must be before to"
        });

      }

      const result =
        await getDashboardData({
          from,
          to
        });

      const revenue =
        Number(result.current.revenue);

      const orders =
        Number(result.current.orders);

      const previousRevenue =
        Number(result.previous.revenue);

      const previousOrders =
        Number(result.previous.orders);

      const aov =
        orders
          ? revenue / orders
          : 0;

      const previousAov =
        previousOrders
          ? previousRevenue /
            previousOrders
          : 0;

      const makeKpi = (
        key: string,
        label: string,
        value: number,
        previous: number,
        formatted: string
      ) => {

        const changePct =
          percentChange(
            value,
            previous
          );

        return {
          key,
          label,
          value,
          formatted,
          changePct,
          direction:
            direction(changePct)
        };
      };

      const kpis = [

        makeKpi(
          "revenue",
          "Revenue",
          revenue,
          previousRevenue,
          formatCurrency(revenue)
        ),

        makeKpi(
          "orders",
          "Orders",
          orders,
          previousOrders,
          orders.toLocaleString("en-IN")
        ),

        makeKpi(
          "aov",
          "Average Order Value",
          aov,
          previousAov,
          formatCurrency(aov)
        ),

        {
          key: "activeCustomers",

          label: "Active Customers",

          value:
            Number(
              result.current.active_customers
            ),

          formatted:
            Number(
              result.current.active_customers
            ).toLocaleString("en-IN"),

          changePct: null,

          direction: "flat" as const
        }

      ];

      res.json({

        generatedAt:
          now.toISOString(),

        filters: {
          from: from.toISOString(),
          to: to.toISOString()
        },

        kpis,

        trend:
          result.trend.map(
            (r: any) => ({
              label: r.label,
              revenue: Number(r.revenue),
              orders: Number(r.orders)
            })
          ),

        segments:
          result.segments.map(
            (r: any) => ({
              segment: r.segment,
              revenue: Number(r.revenue)
            })
          )

      });

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Unknown error";

      res.status(400).json({
        error: message
      });

    }

  }
);


// ---------------------------------------------
// TRANSACTION INGESTION
// ---------------------------------------------

app.post(
  "/api/transactions",
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const body =
        z.object({

          customerId:
            z.number()
             .int()
             .positive(),

          amount:
            z.number()
             .nonnegative(),

          status:
            z.enum([
              "completed",
              "refunded",
              "pending"
            ])
            .default("completed"),

          occurredAt:
            z.coerce.date()
              .optional()

        }).parse(req.body);

      const {
        pool
      } = await import("./db.js");

      const result =
        await pool.query(
          `
          INSERT INTO transactions
            (
              customer_id,
              amount,
              status,
              occurred_at
            )

          VALUES
            ($1, $2, $3, $4)

          RETURNING

            id,

            customer_id AS "customerId",

            amount::float8 AS amount,

            status,

            occurred_at AS "occurredAt"
          `,
          [
            body.customerId,
            body.amount,
            body.status,
            body.occurredAt
              ?? new Date()
          ]
        );

      broadcastRefresh();

      res.status(201).json(
        result.rows[0]
      );

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Invalid transaction";

      res.status(400).json({
        error: message
      });

    }

  }
);


// ---------------------------------------------
// SERVER-SENT EVENTS
// ---------------------------------------------

app.get(
  "/api/events",
  async (
    _req,
    res
  ) => {

    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    res.flushHeaders();

    subscribers.add(res);

    res.write(
      `event: connected\n` +
      `data: ${JSON.stringify({
        at: new Date().toISOString()
      })}\n\n`
    );

    const timer =
      setInterval(() => {

        res.write(
          `event: refresh\n` +
          `data: ${JSON.stringify({
            at: new Date().toISOString()
          })}\n\n`
        );

      }, 10000);

    _req.on(
      "close",
      () => {

        clearInterval(timer);

        subscribers.delete(res);

      }
    );

  }
);
