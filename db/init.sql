CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  segment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL
    CHECK (status IN ('completed', 'refunded', 'pending')),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at
ON transactions(occurred_at);

CREATE INDEX IF NOT EXISTS idx_transactions_status_occurred_at
ON transactions(status, occurred_at);

INSERT INTO customers (name, segment)
SELECT 'Acme Corp', 'Enterprise'
WHERE NOT EXISTS (
  SELECT 1 FROM customers WHERE name = 'Acme Corp'
);

INSERT INTO customers (name, segment)
SELECT 'Northstar Ltd', 'Mid-Market'
WHERE NOT EXISTS (
  SELECT 1 FROM customers WHERE name = 'Northstar Ltd'
);

INSERT INTO customers (name, segment)
SELECT 'Vertex Labs', 'SMB'
WHERE NOT EXISTS (
  SELECT 1 FROM customers WHERE name = 'Vertex Labs'
);

INSERT INTO transactions
  (customer_id, amount, status, occurred_at)

SELECT
  c.id,
  v.amount,
  'completed',
  NOW() - (v.hours || ' hours')::interval

FROM customers c

CROSS JOIN (
  VALUES
    (12800::numeric, 1),
    (9400::numeric, 3),
    (15750::numeric, 5),
    (7200::numeric, 7),
    (18400::numeric, 9),
    (11300::numeric, 12),
    (20500::numeric, 15),
    (8600::numeric, 18),
    (17600::numeric, 21),
    (9900::numeric, 23)
) v(amount, hours)

WHERE c.name = 'Acme Corp'
AND NOT EXISTS (
  SELECT 1
  FROM transactions
  WHERE occurred_at > NOW() - INTERVAL '1 day'
);
