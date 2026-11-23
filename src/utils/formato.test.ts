import { describe, expect, it } from 'vitest';
import { formatearPrecio } from './formato';

describe('formatearPrecio', () => {
  it('usa separador de miles, dos decimales y el sufijo USD', () => {
    expect(formatearPrecio(70000)).toBe('70,000.00 USD');
    expect(formatearPrecio(3500.5)).toBe('3,500.50 USD');
    expect(formatearPrecio(0)).toBe('0.00 USD');
  });
});
