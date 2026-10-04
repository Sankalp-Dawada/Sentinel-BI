import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/db.js';

describe('API Health', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe('bi-dashboard-api');
  });
});

describe('Dashboard', () => {
  it('should return dashboard data with valid date range', async () => {
    const from = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const to = new Date().toISOString();
    const res = await request(app).get(`/api/dashboard?from=${from}&to=${to}`);
    expect(res.status).toBe(200);
    expect(res.body.kpis).toBeDefined();
    expect(res.body.trend).toBeDefined();
    expect(res.body.segments).toBeDefined();
    expect(res.body.kpis.length).toBe(4);
  });

  it('should reject invalid date range (from >= to)', async () => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app).get(`/api/dashboard?from=${from}&to=${to}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('from must be before to');
  });
});

describe('Transactions', () => {
  it('should create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        customerId: 1,
        amount: 5000,
        status: 'completed',
        occurredAt: new Date().toISOString()
      });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(5000);
    expect(res.body.status).toBe('completed');
  });

  it('should reject invalid transaction (negative amount)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        customerId: 1,
        amount: -100,
        status: 'completed'
      });
    expect(res.status).toBe(400);
  });

  it('should reject invalid transaction (invalid status)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({
        customerId: 1,
        amount: 100,
        status: 'invalid'
      });
    expect(res.status).toBe(400);
  });
});