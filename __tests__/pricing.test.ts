import { getPrice, PRICES } from '../lib/pricing';

describe('pricing', () => {
  it('devuelve el precio correcto por país y plan', () => {
    expect(getPrice('MX', 'monthly').amount).toBe(199);
    expect(getPrice('US', 'quarterly').amount).toBe(49.99);
    expect(getPrice('ES', 'monthly').currency).toBe('EUR');
  });

  it('nunca expone variables prohibidas', () => {
    const result = getPrice('MX', 'monthly');
    expect(result).not.toHaveProperty('age');
    expect(result).not.toHaveProperty('gender');
  });

  it('cubre todos los países', () => {
    for (const country of Object.keys(PRICES) as Array<keyof typeof PRICES>) {
      expect(PRICES[country].monthly.amount).toBeGreaterThan(0);
      expect(PRICES[country].quarterly.amount).toBeGreaterThan(0);
    }
  });
});
