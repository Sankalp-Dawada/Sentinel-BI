import { describe, it, expect } from 'vitest';
import { percentChange, direction, formatCurrency } from '../src/kpi.js';

describe('percentChange', () => {
  it('should calculate positive change', () => {
    expect(percentChange(150, 100)).toBe(50);
  });

  it('should calculate negative change', () => {
    expect(percentChange(50, 100)).toBe(-50);
  });

  it('should return 0 when both are 0', () => {
    expect(percentChange(0, 0)).toBe(0);
  });

  it('should return null when previous is 0 but current is not', () => {
    expect(percentChange(100, 0)).toBeNull();
  });
});

describe('direction', () => {
  it('should return "up" for positive change', () => {
    expect(direction(10)).toBe('up');
  });

  it('should return "down" for negative change', () => {
    expect(direction(-10)).toBe('down');
  });

  it('should return "flat" for null', () => {
    expect(direction(null)).toBe('flat');
  });

  it('should return "flat" for near-zero change', () => {
    expect(direction(0.001)).toBe('flat');
  });
});

describe('formatCurrency', () => {
  it('should format INR currency correctly', () => {
    const result = formatCurrency(100000);
    expect(result).toContain('₹');
    expect(result).toContain('1,00,000');
  });

  it('should format zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('₹');
    expect(result).toContain('0');
  });
});