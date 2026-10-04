import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export type DashboardQuery = {
  from: Date;
  to: Date;
};

export async function getDashboardData({
  from,
  to
}: DashboardQuery) {

  const previousFrom = new Date(
    from.getTime() - (to.getTime() - from.getTime())
  );

  const previousTo = new Date(from);

  const [
    current,
    previous,
    trend,
    segments
  ] = await Promise.all([

    pool.query(
      `
      SELECT

        COALESCE(
          SUM(amount)
          FILTER (WHERE status = 'completed'),
          0
        )::float8 AS revenue,

        COUNT(*)
        FILTER (WHERE status = 'completed')
        ::int AS orders,

        COUNT(DISTINCT customer_id)
        FILTER (WHERE status = 'completed')
        ::int AS active_customers

      FROM transactions

      WHERE occurred_at >= $1
      AND occurred_at < $2
      `,
      [from, to]
    ),

    pool.query(
      `
      SELECT

        COALESCE(
          SUM(amount)
          FILTER (WHERE status = 'completed'),
          0
        )::float8 AS revenue,

        COUNT(*)
        FILTER (WHERE status = 'completed')
        ::int AS orders

      FROM transactions

      WHERE occurred_at >= $1
      AND occurred_at < $2
      `,
      [previousFrom, previousTo]
    ),

    pool.query(
      `
      SELECT

        to_char(
          date_trunc('hour', occurred_at),
          'HH24:MI'
        ) AS label,

        COALESCE(
          SUM(amount)
          FILTER (WHERE status = 'completed'),
          0
        )::float8 AS revenue,

        COUNT(*)
        FILTER (WHERE status = 'completed')
        ::int AS orders

      FROM transactions

      WHERE occurred_at >= $1
      AND occurred_at < $2

      GROUP BY 1

      ORDER BY min(occurred_at)
      `,
      [from, to]
    ),

    pool.query(
      `
      SELECT

        c.segment,

        COALESCE(
          SUM(t.amount)
          FILTER (WHERE t.status = 'completed'),
          0
        )::float8 AS revenue

      FROM customers c

      LEFT JOIN transactions t
        ON t.customer_id = c.id
        AND t.occurred_at >= $1
        AND t.occurred_at < $2

      GROUP BY c.segment

      ORDER BY revenue DESC
      `,
      [from, to]
    )
  ]);

  return {
    current: current.rows[0],
    previous: previous.rows[0],
    trend: trend.rows,
    segments: segments.rows
  };
}
